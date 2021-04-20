git init
git remote add origin https://github.com/redlab-app/nm-test.git

git remote add upstream https://github.com/redlab-app/azure.git
git pull upstream main --allow-unrelated-histories

git commit -m "first commit"
git branch -M main
git push -u origin main
