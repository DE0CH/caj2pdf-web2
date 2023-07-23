# PREFIX is environment variable, but if it is not set, then set default value
ifeq ($(HOST),)
    HOST := caj2pdf.deyaochen.com
endif

all: nginx.conf.in
	sed -e 's/SERVER_NAME/$(HOST)/g' nginx.conf.in > build/nginx.conf

install: build/nginx.conf
	install -m 644 build/nginx.conf /etc/nginx/conf.d/$(HOST).conf

