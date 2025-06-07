---
applyTo: '**'
---
All code that wraps google drive api calls is located in src/google directory

UI components shouldn't use code located in src/google directly. It should b
done by custom hooks located in services directory.
