sudo apt-get update
sudo apt-get install -y libpoppler-private-dev
scripts/clone.sh caj2pdf https://github.com/caj2pdf/caj2pdf.git e7bb0bfd43edb8ce29ea02771f3a1850ddef550d
cd caj2pdf/lib
cc -Wall -fPIC --shared -o libjbigdec.so jbigdec.cc JBigDecode.cc
cc -I /usr/include/poppler -Wall `pkg-config --cflags poppler` -fPIC -shared -o libjbig2codec.so decode_jbig2data.cc -lpoppler
cd ..
mv lib/libjbigdec.so .
mv lib/libjbig2codec.so .
pip3 install -r requirements.txt
