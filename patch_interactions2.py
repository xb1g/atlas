import sys

with open("server.ts", "r") as f:
    code = f.read()

# Replace the input strings to add the student_profile.json instruction
old_str = 'input: `Given a student named ${n} (${grade}) interested in: "${activeSession.answers.spark || "Plastics on beaches"}", write a simple 2-paragraph addition representing a documentation guide about microplastic toxicity metrics in nesting sand. Return ONLY the drafted text block to insert.`'
new_str = 'input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, given a student named ${n} (${grade}) interested in: "${activeSession.answers.spark || "Plastics on beaches"}", write a simple 2-paragraph addition representing a documentation guide about microplastic toxicity metrics in nesting sand. Return ONLY the drafted text block to insert.`'
code = code.replace(old_str, new_str)

old_str2 = 'input: `Create an editorial essay'
new_str2 = 'input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, Create an editorial essay'
code = code.replace(old_str2, new_str2)

old_str3 = 'input: `Create an official citizen communication letter'
new_str3 = 'input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, Create an official citizen communication letter'
code = code.replace(old_str3, new_str3)

old_str4 = 'input: `Write a 2-paragraph markdown addition for an AI design guidelines file'
new_str4 = 'input: `Write a student_profile.json file with ${JSON.stringify(activeSession.answers)}. Then, write a 2-paragraph markdown addition for an AI design guidelines file'
code = code.replace(old_str4, new_str4)

with open("server.ts", "w") as f:
    f.write(code)

print("Added student_profile.json to instructions")
