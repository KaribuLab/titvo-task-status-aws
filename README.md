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

## Licencia

Apache License 2.0
