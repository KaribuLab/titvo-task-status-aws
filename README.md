# Titvo Task Status API

## Descripción

Este servicio proporciona una API para consultar el estado de tareas de escaneo. Permite a los usuarios verificar el estado actual de sus escaneos mediante un ID de escaneo y una clave API válida.

## Requisitos

- [NVM](https://github.com/nvm-sh/nvm)
- [Task](https://taskfile.dev/installation/)
- [Terraform](https://developer.hashicorp.com/terraform/install?product_intent=terraform)
- [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/)

> [!IMPORTANT]
> En windows se **DEBE** usar [Windows Subsystem for Linux 2 (WSL2)](https://learn.microsoft.com/es-es/windows/wsl/install)

## Estructura del Proyecto

```shell
.
├── src                  # Código fuente de la aplicación
│   ├── task-status      # Servicios y DTOs para consulta de estado
│   ├── task             # Modelos y repositorio de tareas
│   ├── infrastructure   # Implementaciones de repositorios
│   ├── auth             # Servicios de autenticación
│   └── app.module.ts    # Módulo principal de NestJS
├── lib                  # Bibliotecas internas
│   └── aws              # Utilidades para servicios AWS (S3, DynamoDB, etc.)
├── localstack           # Configuración para desarrollo local
├── aws                  # Recursos de AWS
├── .vscode              # Configuración de VS Code
├── package.json         # Dependencias del proyecto
└── tsconfig.json        # Configuración de TypeScript
```

## Desarrollo Local

Para el desarrollo local, se utiliza LocalStack para simular los servicios de AWS como DynamoDB y S3.

## API

### Endpoint

`POST /task-status`

### Headers

- `x-api-key`: Clave API para autenticación

### Body

```json
{
  "scan_id": "id-del-escaneo"
}
```

### Respuesta

```json
{
  "status": "COMPLETED|FAILED|PENDING",
  "updated_at": "2023-11-15T12:34:56Z",
  "result": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

## Despliegue

Opcionalmente se puede crear un archivo common_tags.json con las etiquetas necesarias:

```json
{
  "Project": "Titvo Security Scan",
  "Customer": "Titvo",
  "Team": "Area Creacion"
}
```

1. Crear archivo .env con las variables necesarias descritas arriba
  ```bash
  export AWS_ACCESS_KEY_ID="tu_access_key"
  export AWS_SECRET_ACCESS_KEY="tu_secret_key"
  export AWS_DEFAULT_REGION="us-east-1"
  export AWS_STAGE="prod"
  export PROJECT_NAME="titvo-task-status" # Opcional si quiere mantener los valores por defecto. Esto se usará como prefijo para los recursos
  export PARAMETER_PATH="/titvo/security-scan" # Opcional si quiere mantener los valores por defecto. Esto se usará como prefijo para los parámetros
  export BUCKET_STATE_NAME="titvo-task-status-terraform-state" # Opcional, si no se especifica se usará el nombre del proyecto. Por ejemplo: titvo-security-scan-terraform-state
  ```
  > [!IMPORTANT]
  > `PARAMETER_PATH`deben tener los mismos valores que se usarion en el proyecto [titvo-security-scan-infra-aws](https://github.com/KaribuLab/titvo-security-scan-infra-aws)
1. Desplegar el proyecto
  ```bash
  npm install
  npm run build
  cd aws
  terragrunt run-all apply --terragrunt-non-interactive --auto-approve
  ```

## Licencia

Apache License 2.0
