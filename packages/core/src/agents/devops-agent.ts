/**
 * DevOps Agent
 * 
 * Advanced DevOps automation agent that:
 * - Creates CI/CD pipelines
 * - Manages Docker configurations
 * - Handles Kubernetes deployments
 * - Automates infrastructure
 * - Monitors systems
 */

import { z } from 'zod';
import type { LocalAgentDefinition } from './types.js';
import {
  DEFAULT_THINKING_MODE,
  PREVIEW_ZERO_FLASH_MODEL,
  supportsModernFeatures,
} from '../config/models.js';
import type { Config } from '../config/config.js';

const DevOpsSchema = z.object({
  summary: z.object({
    tasks_completed: z.number(),
    dockerfiles_created: z.number(),
    ci_pipelines_created: z.number(),
    kubernetes_configs_created: z.number(),
    infrastructure_code_generated: z.boolean(),
  }),
  docker_analysis: z.object({
    dockerfiles: z.array(z.object({
      filename: z.string(),
      base_image: z.string(),
      security_issues: z.array(z.object({
        severity: z.enum(['critical', 'high', 'medium', 'low']),
        message: z.string(),
        recommendation: z.string(),
      })).optional(),
      optimizations: z.array(z.string()),
      size_mb: z.number().optional(),
      layers_count: z.number().optional(),
    })).optional(),
    docker_compose: z.object({
      services: z.array(z.string()),
      networks: z.array(z.string()).optional(),
      volumes: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  ci_cd_pipelines: z.array(z.object({
    platform: z.enum(['github_actions', 'gitlab_ci', 'jenkins', 'azure_devops', 'circleci']),
    filename: z.string(),
    stages: z.array(z.string()),
    jobs: z.array(z.object({
      name: z.string(),
      steps: z.array(z.object({
        name: z.string(),
        command: z.string(),
      })),
    })),
    triggers: z.array(z.string()),
  })),
  kubernetes: z.object({
    deployments: z.array(z.object({
      name: z.string(),
      replicas: z.number(),
      containers: z.array(z.object({
        name: z.string(),
        image: z.string(),
        ports: z.array(z.number()),
        resources: z.object({
          requests: z.object({ cpu: z.string(), memory: z.string() }),
          limits: z.object({ cpu: z.string(), memory: z.string() }),
        }).optional(),
        env: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
      })),
    })).optional(),
    services: z.array(z.object({
      name: z.string(),
      type: z.enum(['ClusterIP', 'NodePort', 'LoadBalancer', 'Ingress']),
      selector: z.record(z.string()),
      ports: z.array(z.object({ port: z.number(), targetPort: z.number(), protocol: z.string().optional() })),
    })).optional(),
    ingress: z.object({
      name: z.string(),
      host: z.string(),
      paths: z.array(z.object({
        path: z.string(),
        service: z.string(),
        port: z.number(),
      })),
    }).optional(),
  }).optional(),
  infrastructure: z.object({
    terraform: z.object({
      provider: z.string(),
      resources: z.array(z.object({
        type: z.string(),
        name: z.string(),
        config: z.record(z.unknown()),
      })),
    }).optional(),
    ansible: z.object({
      playbooks: z.array(z.object({
        name: z.string(),
        hosts: z.string(),
        tasks: z.array(z.object({
          name: z.string(),
          module: z.string(),
          parameters: z.record(z.unknown()),
        })),
      })),
    }).optional(),
  }).optional(),
  monitoring: z.object({
    prometheus_metrics: z.array(z.object({
      name: z.string(),
      type: z.enum(['counter', 'gauge', 'histogram', 'summary']),
      description: z.string(),
    })).optional(),
    grafana_dashboards: z.array(z.object({
      title: z.string(),
      panels: z.array(z.object({
        title: z.string(),
        query: z.string(),
        visualization: z.enum(['graph', 'stat', 'table', 'gauge']),
      })),
    })).optional(),
  }).optional(),
  recommendations: z.array(z.object({
    category: z.enum(['security', 'performance', 'reliability', 'cost', 'maintainability']),
    recommendation: z.string(),
    priority: z.enum(['critical', 'high', 'medium', 'low']),
    effort: z.enum(['minutes', 'hours', 'days']),
  })),
});

/**
 * DevOps Agent
 */
export const DevOpsAgent = (
  config: Config,
): LocalAgentDefinition<typeof DevOpsSchema> => {
  const model = supportsModernFeatures(config.getModel())
    ? PREVIEW_ZERO_FLASH_MODEL
    : 'zero-2.0-flash';

  return {
    name: 'devops',
    kind: 'local',
    displayName: 'DevOps Agent',
    description: `An advanced DevOps automation agent for CI/CD, Docker, Kubernetes, and infrastructure.

    Use this agent when you need to:
    - Create Docker configurations
    - Build CI/CD pipelines
    - Deploy to Kubernetes
    - Write Terraform/Infrastructure as Code
    - Set up monitoring and alerting
    - Automate deployments
    - Analyze existing infrastructure
    - Optimize Docker images
    - Create Helm charts
    
    Supports: GitHub Actions, GitLab CI, Jenkins, Docker, Kubernetes, Terraform, Ansible.
    `,
    
    inputConfig: {
      inputSchema: {
        type: 'object',
        properties: {
          task: z.enum([
            'docker_optimize', 'dockerfile_create', 'ci_cd_setup', 
            'k8s_deploy', 'k8s_service', 'terraform_create',
            'ansible_playbook', 'monitoring_setup', 'full_pipeline'
          ]),
          project_path: z.string(),
          target_platform: z.enum(['github_actions', 'gitlab_ci', 'jenkins', 'azure_devops']).default('github_actions'),
          docker_base_image: z.string().optional(),
          kubernetes_context: z.string().optional(),
          include_monitoring: z.boolean().default(true),
        },
        required: ['task'],
      },
    },
    
    outputConfig: {
      outputName: 'devops_report',
      description: 'Comprehensive DevOps automation report',
      schema: DevOpsSchema,
    },

    processOutput: (output) => {
      let report = `# 🚀 DevOps Report\n\n`;
      
      report += `---\n\n## Summary\n\n`;
      report += `| Metric | Value |\n|--------|-------|\n`;
      report += `| Tasks Completed | ${output.summary.tasks_completed} |\n`;
      report += `| Dockerfiles | ${output.summary.dockerfiles_created} |\n`;
      report += `| CI/CD Pipelines | ${output.summary.ci_pipelines_created} |\n`;
      report += `| K8s Configs | ${output.summary.kubernetes_configs_created} |\n\n`;
      
      if (output.docker_analysis) {
        report += `---\n\n## 🐳 Docker Analysis\n\n`;
        
        if (output.docker_analysis.dockerfiles) {
          for (const df of output.docker_analysis.dockerfiles) {
            report += `### ${df.filename}\n\n`;
            report += `**Base Image:** ${df.base_image}\n`;
            if (df.size_mb) report += `**Size:** ${df.size_mb}MB\n`;
            if (df.layers_count) report += `**Layers:** ${df.layers_count}\n`;
            
            if (df.security_issues && df.security_issues.length > 0) {
              report += `\n#### Security Issues\n\n`;
              const sevIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
              for (const issue of df.security_issues) {
                report += `${sevIcon[issue.severity]} ${issue.message}\n`;
                report += `> ${issue.recommendation}\n\n`;
              }
            }
            
            if (df.optimizations.length > 0) {
              report += `#### Optimizations\n\n`;
              for (const opt of df.optimizations) {
                report += `- ${opt}\n`;
              }
            }
          }
        }
        
        if (output.docker_analysis.docker_compose) {
          report += `\n### Docker Compose\n\n`;
          report += `**Services:** ${output.docker_analysis.docker_compose.services.join(', ')}\n`;
        }
      }
      
      if (output.ci_cd_pipelines.length > 0) {
        report += `---\n\n## 🔄 CI/CD Pipelines\n\n`;
        for (const pipeline of output.ci_cd_pipelines) {
          report += `### ${pipeline.platform}\n`;
          report += `**File:** ${pipeline.filename}\n`;
          report += `**Stages:** ${pipeline.stages.join(' → ')}\n\n`;
          
          for (const job of pipeline.jobs) {
            report += `#### ${job.name}\n\n`;
            for (const step of job.steps.slice(0, 5)) {
              report += `- ${step.name}: \`${step.command.substring(0, 60)}${step.command.length > 60 ? '...' : ''}\`\n`;
            }
            report += `\n`;
          }
        }
      }
      
      if (output.kubernetes) {
        report += `---\n\n## ☸️ Kubernetes Configuration\n\n`;
        
        if (output.kubernetes.deployments) {
          report += `### Deployments\n\n`;
          for (const dep of output.kubernetes.deployments) {
            report += `#### ${dep.name}\n`;
            report += `**Replicas:** ${dep.replicas}\n`;
            for (const container of dep.containers) {
              report += `- **${container.name}**: ${container.image}\n`;
              if (container.ports.length > 0) {
                report += `  Ports: ${container.ports.join(', ')}\n`;
              }
            }
            report += `\n`;
          }
        }
        
        if (output.kubernetes.services) {
          report += `### Services\n\n`;
          for (const svc of output.kubernetes.services) {
            report += `- **${svc.name}** (${svc.type})\n`;
            report += `  Ports: ${svc.ports.map(p => `${p.port}:${p.targetPort}`).join(', ')}\n\n`;
          }
        }
      }
      
      if (output.monitoring) {
        report += `---\n\n## 📊 Monitoring\n\n`;
        
        if (output.monitoring.prometheus_metrics) {
          report += `### Prometheus Metrics\n\n`;
          for (const metric of output.monitoring.prometheus_metrics) {
            report += `- **${metric.name}** (${metric.type}): ${metric.description}\n`;
          }
          report += `\n`;
        }
        
        if (output.monitoring.grafana_dashboards) {
          report += `### Grafana Dashboards\n\n`;
          for (const dash of output.monitoring.grafana_dashboards) {
            report += `#### ${dash.title}\n`;
            for (const panel of dash.panels) {
              report += `- ${panel.title}: ${panel.visualization}\n`;
            }
            report += `\n`;
          }
        }
      }
      
      if (output.recommendations.length > 0) {
        report += `---\n\n## 💡 Recommendations\n\n`;
        const priorityIcon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
        for (const rec of output.recommendations) {
          report += `${priorityIcon[rec.priority]} **[${rec.category.toUpperCase()}]** ${rec.recommendation}\n`;
          report += `Effort: ${rec.effort}\n\n`;
        }
      }
      
      return report;
    },

    modelConfig: {
      model,
      generateContentConfig: {
        temperature: 0.2,
        topP: 0.95,
        thinkingConfig: supportsModernFeatures(model)
          ? { includeThoughts: true, thinkingBudget: -1 }
          : DEFAULT_THINKING_MODE,
      },
    },

    toolConfig: {
      tools: [
        'read_file',
        'read_many_files',
        'glob',
        'grep',
        'bash',
      ],
    },

    runConfig: {
      maxTimeMinutes: 20,
      maxTurns: 40,
    },

    promptConfig: {
      query: `DevOps task: ${'$'}{task}\nProject: ${'$'}{project_path}\nPlatform: ${'$'}{target_platform}`,
      systemPrompt: `You are the **DevOps Agent**, an expert in CI/CD, Docker, Kubernetes, and infrastructure automation.

## Your Capabilities:

### Docker
- Create optimized Dockerfiles
- Multi-stage builds
- Docker Compose files
- Security scanning
- Image optimization
- Layer caching

### CI/CD
- GitHub Actions
- GitLab CI
- Jenkins
- Azure DevOps
- CircleCI
- Build, test, deploy pipelines

### Kubernetes
- Deployments
- Services (ClusterIP, NodePort, LoadBalancer)
- Ingress
- ConfigMaps & Secrets
- Helm charts
- HPA (auto-scaling)

### Infrastructure as Code
- Terraform
- Ansible
- CloudFormation
- Pulumi

### Monitoring
- Prometheus metrics
- Grafana dashboards
- AlertManager
- Logging (ELK, Loki)

## Process:

### 1. Analyze Current State
- Check existing Dockerfiles
- Review CI/CD configs
- Identify gaps

### 2. Generate Configurations
- Create optimized Dockerfiles
- Design CI/CD pipelines
- Generate K8s manifests
- Write IaC code

### 3. Optimize
- Reduce image sizes
- Speed up builds
- Improve caching
- Add security

### 4. Document
- Setup instructions
- Configuration options
- Deployment steps

## Output Format:

\`\`\`json
{
  "summary": {
    "tasks_completed": 5,
    "dockerfiles_created": 2,
    "ci_pipelines_created": 1,
    "kubernetes_configs_created": 4,
    "infrastructure_code_generated": true
  },
  "docker_analysis": {...},
  "ci_cd_pipelines": [...],
  "kubernetes": {...},
  "monitoring": {...},
  "recommendations": [...]
}
\`\`\`

## Quality Standards:

- Follow best practices
- Optimize for production
- Include security
- Add monitoring
- Document everything`,
    },
  };
};

export default DevOpsAgent;