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

Modifica los valores del archivo `serverless.hcl` con los valores de tu proyecto.

```hcl
locals {
  region = get_env("AWS_REGION")
  stage  = get_env("AWS_STAGE")
  stages = {
    test = {
      name = "Testing"
    },
    localstack = {
      name = "Localstack"
    },
    prod = {
      name = "Production"
    }
  }
  service_name   = "my-service"
  service_bucket = "${local.service_name}-${local.region}"
  log_retention  = 7
  parameter_path = "/my-service"
  common_tags = {
    my_tag = "my-tag-value"
  }
}
```

1. Clone el repositorio en la máquina local.

  ```shell
  git clone https://github.com/KaribuLab/titvo-task-status.git
  cd titvo-task-status
  git submodule init
  git submodule update
  ```

2. Primero necesitará cargar las variables ambiente con las credenciales de AWS.

  ```shell
  export AWS_ACCESS_KEY_ID="..."
  export AWS_SECRET_ACCESS_KEY="..."
  export AWS_SESSION_TOKEN="..."
  export AWS_REGION="..."
  export AWS_STAGE="..."
  ```

  O creando un archivo `.env` en la raíz del proyecto con las variables de entorno.

  ```shell
  export AWS_ACCESS_KEY_ID="..."
  export AWS_SECRET_ACCESS_KEY="..."
  export AWS_SESSION_TOKEN="..."
  export AWS_REGION="..."
  export AWS_STAGE="..."
  ```

  > [!NOTE]
  > Para cargar las variables de entorno, se puede usar el siguiente comando: `source .env`.

3. Luego, se puede proceder a instalar las dependencias y ejecutar el despliegue.

  ```shell
  npm install
  npm run build
  cd aws
  terragrunt run-all apply
  ```


## Licencia

Apache License 2.0
