import json

def main():
    with open('tsconfig.base.json', 'r') as f:
        config = json.load(f)

    paths = config.get('compilerOptions', {}).get('paths', {})

    paths['@virteex/domain-finops-application'] = ["libs/domain/finops/application/src/index.ts"]
    paths['@virteex/domain-finops-application/*'] = ["libs/domain/finops/application/src/*"]

    config['compilerOptions']['paths'] = paths

    with open('tsconfig.base.json', 'w') as f:
        json.dump(config, f, indent=2)
        f.write('\n')

if __name__ == "__main__":
    main()
