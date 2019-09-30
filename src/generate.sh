# ./generate.sh
filelist=`ls contents/`

# if [ ! -e filename ]; then ...

#if [ -e ./dst ]; then
#  :
#else
#  mkdir ./dst/
#  echo "make directory: ./dst"
#fi

#rm -r ./dst/*
#echo "remove any files in directory: dst."

for f in $filelist; do
  echo $f
  touch ./$f
  cat ./common/header.html > ./$f
  cat ./contents/$f >> ./$f
  cat ./common/footer.html >> ./$f
done
