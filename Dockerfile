FROM python:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update
RUN apt-get install -y build-essential libjbig2dec0-dev git
RUN mkdir /usr/app
WORKDIR /usr/app
RUN git clone https://github.com/caj2pdf/caj2pdf.git
WORKDIR /usr/app/caj2pdf/lib
RUN cc -Wall -fPIC --shared -o libjbigdec.so jbigdec.cc JBigDecode.cc
RUN cc -Wall -fPIC -shared -o libjbig2codec.so decode_jbig2data_x.cc -ljbig2dec
RUN cp libjbigdec.so ../
WORKDIR /usr/app/caj2pdf
RUN pip install -r requirements.txt
