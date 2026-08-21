{{/*
Expand the chart name.
*/}}
{{- define "nginx-learning.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "nginx-learning.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common labels applied to most resources.
*/}}
{{- define "nginx-learning.labels" -}}
app.kubernetes.io/name: {{ include "nginx-learning.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/part-of: nginx-learning
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}

{{/*
Stable Kubernetes Service name for users (used in NGINX upstream).
*/}}
{{- define "nginx-learning.usersServiceName" -}}
users-service
{{- end }}

{{/*
Stable Kubernetes Service name for orders (used in NGINX upstream).
*/}}
{{- define "nginx-learning.ordersServiceName" -}}
orders-service
{{- end }}

{{/*
Stable Kubernetes Service name for stock (used in NGINX upstream + orders env).
*/}}
{{- define "nginx-learning.stockServiceName" -}}
stock-service
{{- end }}

{{/*
NGINX Service name.
*/}}
{{- define "nginx-learning.nginxServiceName" -}}
nginx
{{- end }}
