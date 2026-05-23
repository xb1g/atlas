import re

with open("server.ts", "r") as f:
    code = f.read()

# Replace all occurrences of:
# const generation = await client.models.generateContent({
#   model: "gemini-3.5-flash",
#   contents: `...`
# });
# with the interactions API version, inside the /api/project/select route
# We can use regex to find them

pattern = r'const generation = await client\.models\.generateContent\(\{\s*model:\s*"gemini-3\.5-flash",\s*contents:\s*(.*?)\s*\}\);'

def replacer(match):
    contents = match.group(1)
    return f'''const generation = await (client as any).interactions.create({{
          agent: "antigravity-preview-05-2026",
          input: {contents},
          environment: "remote"
        }});'''

new_code = re.sub(pattern, replacer, code)

# Also replace generation.text with (generation.text || generation.outputText)
new_code = new_code.replace("generation.text ||", "(generation.text || generation.outputText) ||")

with open("server.ts", "w") as f:
    f.write(new_code)

print("Patched interactions API")
