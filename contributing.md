# Contributing Guidelines – VOP LMS  
Developed by **Kellzman Tech Ltd**

This document defines how to collaborate effectively on this project.  
It applies to all developers working on the **Voice of Prophecy LMS** system.

---

##  1. Branch Naming Convention

Follow clear and lowercase branch names. Use slashes for category separation.

| Type | Format | Example | Purpose |
|------|---------|----------|----------|
| Feature | `feature/<short-description>` | `feature/login-page` | For new modules or functionality |
| Fix | `fix/<short-description>` | `fix/quiz-score-bug` | For bug fixes |
| Update | `update/<short-description>` | `update/dashboard-ui` | For improving or refining code/UI |
| Hotfix | `hotfix/<short-description>` | `hotfix/api-auth` | For urgent production fixes |
| Test | `test/<short-description>` | `test/user-endpoints` | For experiments or testing work |

**Example:**
feature/lesson-module
fix/otp-verification


## 2. Commit Message Convention

Use clear, consistent commit messages following this structure:

<type>: <short summary>




### Accepted Commit Types
| Type |                Use For                                            | Example |
|------|                ----------                                          |----------|
| feat |                New feature                           | `feat: add OTP email verification` |
| fix |                 Bug fix                              | `fix: correct course progress issue`|
| style |               UI or CSS updates                    | `style: refine dashboard layout` |
| refactor |            Code structure changes                | `refactor: simplify quiz logic` |
| docs |             Documentation                    | `docs: update README with new setup steps` |
| chore |                Maintenance/config                     | `chore: update .gitignore file` |

**Examples:**
feat: add course catalog and lesson viewer
fix: resolve broken quiz auto-grading

---

## 3. Workflow Summary

1. **Pull latest code**
  
   git pull origin main
Create a branch


git checkout -b feature/<task-name>
Add and commit your work


git add .
git commit -m "feat: implement login with OTP"
Push your branch


git push origin feature/<task-name>
Create a Pull Request (PR)

Go to GitHub and open a PR into main.

Assign a reviewer 

Merge and Clean Up

Once reviewed and approved, merge the PR.

Delete the feature branch to keep the repo clean.

## 4. Code Standards ##

Write clear, modular components — no duplicate logic.

Always use environment variables for sensitive data.

Comment key functions and endpoints.

## 5. Pull Request Checklist ##
Before submitting a PR:

 Code compiles without errors.

 Feature tested locally.

 No console logs or unused imports.

 Commit message follows standard.

 Branch is up to date with main.

## 6. Contacts ##
Project Lead: Emmanuel Okoth/ Frontend Developer
📧 kellzmantech@outlook.com

Backend Developer: Bruce Ochieng
bruceomondi960@gmail.com