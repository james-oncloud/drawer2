# Jenkins Pipeline Exercises

Hands-on exercises for understanding Jenkins pipeline setup and configuration, using the local Docker Compose stack in this directory.

**Prerequisites:** Docker and Docker Compose installed.

**Start Jenkins:**

```bash
./shell/start-jenkins.sh
```

Open the UI at [http://localhost:8081](http://localhost:8081). On first run, use the initial admin password printed by the start script.

---

## Exercise 1: Local Setup and First Pipeline Job

**Goal:** Understand how Jenkins runs locally and how a job is wired to a `Jenkinsfile`.

### Tasks

1. Start Jenkins with `./shell/start-jenkins.sh` and complete the setup wizard:
   - Install the suggested plugins.
   - Create an admin user (or skip if you prefer the default for local learning).

2. Create a new **Pipeline** job named `hello-pipeline`:
   - **New Item** → name `hello-pipeline` → **Pipeline** → OK.
   - Under **Pipeline**, set **Definition** to **Pipeline script** (inline, not from SCM yet).

3. Paste this declarative pipeline and save:

   ```groovy
   pipeline {
       agent any

       stages {
           stage('Hello') {
               steps {
                   echo 'Hello from Jenkins!'
               }
           }
           stage('Environment') {
               steps {
                   echo "BUILD_NUMBER: ${env.BUILD_NUMBER}"
                   echo "JOB_NAME: ${env.JOB_NAME}"
               }
           }
       }

       post {
           success {
               echo 'Pipeline finished successfully.'
           }
           failure {
               echo 'Pipeline failed.'
           }
       }
   }
   ```

4. Click **Build Now** and open the build in **Console Output**.

### What to observe

- `agent any` tells Jenkins to run on any available executor (here, the controller inside the container).
- **Stages** group steps; **post** runs after all stages complete.
- Built-in environment variables (`BUILD_NUMBER`, `JOB_NAME`) are available in every pipeline.

### Check your understanding

- What is the difference between a **Freestyle** job and a **Pipeline** job?
- Why does Jenkins show each stage separately in the build UI?

---

## Exercise 2: Declarative Pipeline from SCM

**Goal:** Learn the standard pattern—pipeline definition lives in the repo as `Jenkinsfile`, and Jenkins loads it from source control.

### Tasks

1. In any small Git repository (or a new test repo), add a `Jenkinsfile` at the root:

   ```groovy
   pipeline {
       agent any

       stages {
           stage('Checkout') {
               steps {
                   checkout scm
               }
           }
           stage('Build') {
               steps {
                   sh 'echo "Simulating build..." && sleep 2'
               }
           }
           stage('Test') {
               steps {
                   sh 'echo "Running tests..." && echo "All tests passed."'
               }
           }
       }
   }
   ```

2. Commit and push the file.

3. In Jenkins, create a **Pipeline** job named `pipeline-from-scm`:
   - **Pipeline** → **Definition**: **Pipeline script from SCM**
   - **SCM**: Git
   - **Repository URL**: your repo URL
   - **Branch**: `*/main` (or your default branch)
   - **Script Path**: `Jenkinsfile`

4. Run **Build Now**. Confirm all three stages appear and succeed.

5. Change the `Build` stage to fail on purpose (e.g. `sh 'exit 1'`), push, and build again. Note how Jenkins marks the job failed and which stage broke.

### What to observe

- `checkout scm` uses the same Git config you set on the job.
- Pipeline-as-code: the job config points at the repo; behavior is defined in `Jenkinsfile`.
- Failed stages stop later stages from running (unless you add `catchError` or similar).

### Check your understanding

- Why is storing the pipeline in Git preferable to pasting script into the Jenkins UI?
- What would you change to run the `Test` stage only when `Build` succeeds?

---

## Exercise 3: Parameters, Environment, and Docker Integration

**Goal:** Configure a parameterized pipeline and use the Docker socket mounted in `docker-compose.yml` so pipelines can run container commands on the host.

This stack mounts `/var/run/docker.sock` into the Jenkins container (see `docker-compose.yml`), which lets pipeline steps invoke Docker on your machine.

### Tasks

1. Create a **Pipeline** job named `parameterized-docker` with this inline script:

   ```groovy
   pipeline {
       agent any

       parameters {
           choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
           booleanParam(name: 'RUN_DOCKER_CHECK', defaultValue: true, description: 'Run docker version check')
       }

       environment {
           DEPLOY_TARGET = "${params.ENVIRONMENT}"
       }

       stages {
           stage('Validate') {
               steps {
                   echo "Deploy target: ${env.DEPLOY_TARGET}"
               }
           }
           stage('Docker Check') {
               when {
                   expression { return params.RUN_DOCKER_CHECK }
               }
               steps {
                   sh 'docker --version'
                   sh 'docker ps --format "table {{.Names}}\t{{.Status}}"'
               }
           }
           stage('Simulate Deploy') {
               steps {
                   echo "Would deploy to ${env.DEPLOY_TARGET}"
               }
           }
       }
   }
   ```

2. Save the job, then run **Build with Parameters**:
   - Try `ENVIRONMENT=dev` with `RUN_DOCKER_CHECK` enabled.
   - Run again with `RUN_DOCKER_CHECK` unchecked and confirm the **Docker Check** stage is skipped.

3. Open **Manage Jenkins** → **Tools** (or **Global Tool Configuration**) and note where you would register JDK, Maven, or Node versions for use in pipelines (`tool 'jdk17'` etc.). You do not need to install tools for this exercise—just locate the screen.

4. Optional: add a `post { always { ... } }` block that archives a fake artifact:

   ```groovy
   post {
       always {
           writeFile file: 'build-info.txt', text: "Built for ${env.DEPLOY_TARGET} at ${env.BUILD_NUMBER}"
           archiveArtifacts artifacts: 'build-info.txt', fingerprint: true
       }
   }
   ```

   Rebuild and confirm **build-info.txt** appears under **Artifacts** for that build.

### What to observe

- **parameters** define inputs shown at build time; **environment** sets variables for the run.
- **when** conditionally runs stages (here, only if the boolean param is true).
- Docker commands work because the socket is mounted—without that volume, `docker` inside the container would not reach the host daemon.

### Check your understanding

- What is the difference between `params.ENVIRONMENT` and `env.DEPLOY_TARGET` in this pipeline?
- Why might mounting the Docker socket be convenient for local learning but risky in production?
- Where would you store secrets (API keys, registry passwords) instead of hard-coding them in a `Jenkinsfile`?

---

## Exercise 4: Set Up a Shared Library

**Goal:** Extract reusable pipeline logic into a **Global Shared Library** so multiple jobs can call the same Groovy steps without duplicating code.

A shared library is a Git repository with a fixed layout. Jenkins loads it at build time when a `Jenkinsfile` references it with `@Library`.

### Tasks

#### Part A — Create the library repository

1. Create a new Git repository (separate from your application repo), e.g. `jenkins-shared-library`.

2. Add a **global variable step** in `vars/runChecks.groovy`:

   ```groovy
   def call(Map config = [:]) {
       echo "Running checks for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
       if (config.command) {
           sh config.command
       } else {
           echo 'No command specified — skipping shell step.'
       }
   }
   ```

   Files under `vars/` become callable steps. The filename (`runChecks`) is the step name used in pipelines.

3. Add a **utility class** in `src/org/example/BuildInfo.groovy`:

   ```groovy
   package org.example

   class BuildInfo implements Serializable {

       String summary(String jobName, String buildNumber) {
           return "Job ${jobName} build #${buildNumber}"
       }
   }
   ```

   Classes under `src/` must be `Serializable` and are imported by package name.

4. Commit and push. Your repo should look like:

   ```
   jenkins-shared-library/
   ├── vars/
   │   └── runChecks.groovy
   └── src/
       └── org/
           └── example/
               └── BuildInfo.groovy
   ```

#### Part B — Register the library in Jenkins

5. Open **Manage Jenkins** → **System** → scroll to **Global Pipeline Libraries**.

6. Click **Add**, then configure:

   | Field | Value |
   |-------|-------|
   | **Name** | `my-shared-library` |
   | **Default version** | `main` (or your default branch) |
   | **Load implicitly** | unchecked (we will use `@Library` explicitly) |
   | **Allow default version to be overridden** | checked (useful for testing branches) |

7. Under **Retrieval method**, choose **Modern SCM** → **Git**:
   - **Project repository**: URL of your `jenkins-shared-library` repo
   - **Credentials**: add if the repo is private

8. Save.

#### Part C — Use the library in a pipeline

9. Create a **Pipeline** job named `shared-library-demo` with this script:

   ```groovy
   @Library('my-shared-library') _
   import org.example.BuildInfo

   pipeline {
       agent any

       stages {
           stage('Info') {
               steps {
                   script {
                       def info = new BuildInfo()
                       echo info.summary(env.JOB_NAME, env.BUILD_NUMBER)
                   }
               }
           }
           stage('Unit Tests') {
               steps {
                   runChecks(command: 'echo "tests ok"')
               }
           }
       }
   }
   ```

10. Run **Build Now**. Confirm:
    - The **Info** stage prints the summary from `BuildInfo`.
    - The **Unit Tests** stage runs the shell command via the shared `runChecks` step.

11. Change `runChecks.groovy` in the library repo (e.g. add another `echo`), commit, push, and rebuild. Jenkins fetches the library at the **Default version** on each build—no job config change needed.

12. Optional: rebuild with a library override. In the job's **Pipeline** section, temporarily set **Pipeline script** to:

    ```groovy
    @Library('my-shared-library@your-feature-branch') _
    ```

    Or pass a branch when triggering via API. This is how teams test library changes before merging to `main`.

### What to observe

- `@Library('my-shared-library') _` loads the library; the trailing `_` imports all `vars/` steps into the script scope.
- `vars/` steps are **global functions**—simple, pipeline-friendly wrappers.
- `src/` classes hold richer logic but must be imported and instantiated inside a `script { }` block in declarative pipelines.
- The library name in `@Library` must match the **Name** field in Global Pipeline Libraries, not the Git repo folder name.

### Check your understanding

- When would you put logic in `vars/` versus `src/`?
- What happens if two libraries define a `vars/` step with the same name?
- Why must classes in `src/` implement `Serializable`?
- How would you pin a production job to a specific library tag (e.g. `@Library('my-shared-library@v1.2.0')`)?

---

## Next steps

After these exercises, try:

- **Multibranch Pipeline** — Jenkins discovers branches and runs the `Jenkinsfile` on each.
- **Jenkins Configuration as Code (JCasC)** — export controller settings to YAML for reproducible setups.

For reference, this project's Compose file exposes Jenkins on port **8081** and persists data in the `jenkins_home` Docker volume.
