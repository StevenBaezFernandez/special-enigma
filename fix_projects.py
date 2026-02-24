import os
import json

def fix_domain_projects():
    domains_dir = 'libs/domains'
    for domain in os.listdir(domains_dir):
        domain_path = os.path.join(domains_dir, domain)
        if not os.path.isdir(domain_path): continue
        for layer in os.listdir(domain_path):
            layer_path = os.path.join(domain_path, layer)
            p_path = os.path.join(layer_path, 'project.json')
            if os.path.exists(p_path):
                with open(p_path, 'r') as f:
                    data = json.load(f)

                old_name = data.get('name')
                if not old_name: continue

                new_name = None
                if layer == 'domain' and not old_name.startswith('domain-'):
                    new_name = f"domain-{old_name}"
                elif layer == 'infrastructure' and not old_name.startswith('infra-'):
                    new_name = f"infra-{old_name}"
                elif layer == 'application' and not old_name.startswith('application-'):
                    new_name = f"application-{old_name}"
                elif layer == 'presentation':
                    platform = "api"
                    tags = data.get('tags', [])
                    if any('platform:web' in t or 'platform:angular' in t for t in tags):
                        platform = "web"
                    if not old_name.startswith(f"{platform}-"):
                        new_name = f"{platform}-{old_name}"
                elif layer == 'contracts' and not old_name.startswith('contracts-'):
                    new_name = f"contracts-{old_name}"

                if new_name:
                    print(f"Renaming {old_name} -> {new_name}")
                    data['name'] = new_name
                    with open(p_path, 'w') as f:
                        json.dump(data, f, indent=2)

if __name__ == "__main__":
    fix_domain_projects()
