# The Solenoid Contribution Guide


1. Make your fork, don't push directly (For repository admins/maintainers)
    - You need to make a fork of Solenoid
      before changing the code, last time I had a
      issue with a faulty commit and it was expensive
      to fix it. I don't want it to happen again.

2. Check code linting issues beforehand
    - We do have a gh-action that does that for us.
      But it's better when you do it beforehand.

    - Use `prettier` and `eslint` to format and lint code.

3. Commit using the conventional commits specifications
    - This makes the git commit history easier to read,
      and allows anyone to find a specific commit with
      ease if they want to revert to it.

4. Mention Issues if that PR Closes it
    - This helps issue management because Github closes
    issues if a PR or a commit contains
    "Closes #<issue>" on it's title/body
    
5. Do not break userspace at any costs, test rigorously before pushing
   - As in the words of Linus Torvalds
     > "WE DO NOT BREAK USERSPACE!"
