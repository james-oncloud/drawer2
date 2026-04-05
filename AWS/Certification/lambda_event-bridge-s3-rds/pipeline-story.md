# A story of one file’s journey

Imagine a company that collects **batch files**—orders, logs, whatever lives in CSV or Parquet. Nobody wakes the ops team for each drop: upstream systems simply **put the file in a bucket**, in a known place, and walk away. From the outside it looks like the bucket quietly **swallows** the bytes; inside AWS, that upload is an **event** waiting to happen.

---

The file has **landed** in S3. The bucket is not dumb storage here—it’s the **front door**. The object gets a key like `incoming/2026/04/05/run-7f3a/data.csv`. Durability is the warehouse: once the upload completes, the blob is there for the pipeline to rely on. No scheduler polled the folder; the landing *is* the signal that work exists.

---

That signal doesn’t have to be a human clicking “process.” With **EventBridge** in the picture, S3 can **tell the world**—in structured JSON—*something was created, here’s the bucket, here’s the key.* An **event rule** is like a thoughtful receptionist: it watches the stream, matches “this bucket, this prefix, this kind of change,” and decides **who** should hear about it. For you, the listener is **Lambda**: small, pay-per-use compute that wakes when the event arrives.

So the file is resting in S3, and **EventBridge is the messenger** that taps Lambda on the shoulder: *You’ve got mail.*

---

Lambda **spins up** (sometimes from cold, sometimes from a warm handoff—it’s an implementation detail, but the story beat is the same). It reads the **event envelope**, extracts **bucket** and **key**, and uses the AWS SDK to **pull the object**—the same file that “auto-landed,” now flowing through code instead of through a human.

What happens next is your business story in miniature: validate, parse, normalize, enrich, reject bad rows, summarize. The important architectural beat: **S3 holds the heavy blob**, **Lambda holds the logic** for a bounded chunk of work—bounded by time, memory, and how you’ve designed the job.

Then two kinds of **persistence** get their scene.

**Back to S3** goes the narrative of artifacts: a cleaned file, a manifest, error excerpts, a PDF—whatever isn’t best modeled as rows. Keys might move from `incoming/` to `processed/` or sit under `outputs/` with a new name. The river still flows object-by-object; you’re just **writing the next chapter** of the dataset.

**Into RDS** goes the **structured truth** you care to query and join: status per file, row counts, foreign keys to customers, idempotent upserts keyed by job ID—*the database as ledger*, not as a duplicate of every fat file. If RDS lives in a private subnet, Lambda had to be introduced to the same **VPC neighborhood** and the right **security groups**, like giving the worker a badge that only opens the doors you intend.

---

When the worker is done—success or a controlled failure—the story shouldn’t end in silence. **Lambda raises its hand to AWS again**, this time as a **publisher**: `PutEvents` onto EventBridge with a **source** and **detail-type** you define—`ProcessingCompleted`, `ProcessingFailed`, whatever matches your world. The **detail** carries the breadcrumbs: job id, input key, output prefixes, rows written, error code.

Downstream fans don’t need to watch S3 or guess. **Subscribers**—another Lambda, a Step Functions workflow, a metrics sink, a ticket system—each get a rule that says: *when **this** story concludes, **I** act.* The pipeline that began with an unattended upload **closes the loop** with an explicit **completion event**.

---

**In one breath:** a file **falls into** S3; **EventBridge** **whispers** to Lambda; Lambda **reads** from S3, **thinks**, **writes** files to S3 and **rows** to RDS; then it **broadcasts** **“done”** on EventBridge so the rest of the system can **hear** the ending and write the next chapter.

---

*Based on pipeline steps: S3 ingest → EventBridge notification → Lambda (S3 + RDS) → EventBridge completion.*
