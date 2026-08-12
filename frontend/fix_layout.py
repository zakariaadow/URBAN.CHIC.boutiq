import re

with open('src/layouts/StylistLayout.jsx', 'r') as f:
    content = f.read()

# Fix the api.create block
content = content.replace(
    "  }\n  useEffect",
    "  }\n  });\n\n  useEffect"
)

# Fix missing closing bracket for if statement
content = content.replace(
    "      navigate('/login');\n      return;\n    if (userRole !== 'stylist')",
    "      navigate('/login');\n      return;\n    }\n    if (userRole !== 'stylist')"
)

with open('src/layouts/StylistLayout.jsx', 'w') as f:
    f.write(content)

print("✅ Fixed StylistLayout.jsx")
