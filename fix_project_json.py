import json
import os

services = [
    "accounting",
    "payroll",
    "projects",
    "manufacturing",
    "treasury",
    "purchasing",
    "bi",
    "admin",
    "fixed-assets"
]

for service in services:
    app_name = f"virteex-{service}-service"
    project_json_path = f"apps/{app_name}/project.json"

    if not os.path.exists(project_json_path):
        print(f"Skipping {app_name}, file not found.")
        continue

    with open(project_json_path, "r") as f:
        data = json.load(f)

    # Standard build config
    build_config = {
        "executor": "@nx/webpack:webpack",
        "outputs": ["{options.outputPath}"],
        "defaultConfiguration": "production",
        "options": {
            "target": "node",
            "compiler": "tsc",
            "outputPath": f"dist/apps/{app_name}",
            "main": f"apps/{app_name}/src/main.ts",
            "tsConfig": f"apps/{app_name}/tsconfig.app.json",
            "assets": [f"apps/{app_name}/src/assets"],
            "webpackConfig": f"apps/{app_name}/webpack.config.js"
        },
        "configurations": {
            "development": {},
            "production": {
                "optimization": True,
                "extractLicenses": True,
                "inspect": False,
                "fileReplacements": [
                    {
                        "replace": f"apps/{app_name}/src/environments/environment.ts",
                        "with": f"apps/{app_name}/src/environments/environment.prod.ts"
                    }
                ]
            }
        }
    }

    data["targets"]["build"] = build_config

    # Also update serve config to rely on build correctly
    data["targets"]["serve"] = {
        "executor": "@nx/js:node",
        "defaultConfiguration": "development",
        "options": {
            "buildTarget": f"{app_name}:build"
        },
        "configurations": {
            "development": {
                "buildTarget": f"{app_name}:build:development"
            },
            "production": {
                "buildTarget": f"{app_name}:build:production"
            }
        }
    }

    with open(project_json_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Updated {app_name}/project.json")
