


Vue.createApp({
    data() {
        return {
            pdfPreview: null,
            show: {
                preview: false,
                cargando: false
            }
        }
    },
    methods: {
        getReporte(load = false, tipo = 1, preview = false) {
            return new Promise((success, fail) => {
                if (load) {
                    setLoader();
                }

                if (preview) {
                    this.show.cargando = true;
                }

                // Fetch the PDF for preview
                axios.post(`${url}RedOsel/EstadosCuenta`, {
                    idUsuario: mainApp.idUsuario,
                    tipo: tipo
                }, {
                    responseType: 'blob'
                }).then(response => {
                    console.log(response);


                    if (preview) {
                        const file = new Blob([response.data], { type: response.headers['content-type'] });
                        var url = URL.createObjectURL(file);
                        this.setPreview(file, url);
                    } else {
                        var link = document.createElement('a');

                        const file = new Blob([response.data], { type: response.headers['content-type'] });
                        var url = URL.createObjectURL(file);
                        link.href = url;
                        link.download = tipo === 1 ? 'EstadosCuentaCliente.pdf' : 'EstadosCuentaCliente.xlsx';
                        link.target = '_blank';
                        link.click();

                        URL.revokeObjectURL(url);
                        link = null;
                    }
                    setLoader('hide');
                }).catch(error => {
                    this.show.cargando = false;
                    validError(error);
                });
            })
        },
        setPreview(file, url) {
            this.show.cargando = false;

            setTimeout(_ => {
                const pdfPreview = this.$refs.pdfPreview;
                pdfPreview.data = url;

                var link = this.$refs.link;
                link.href = url;
                link.setAttribute('download', 'EstadosDeCuentaClientes.pdf');

                pdfPreview.appendChild(link)
            }, 100);
        }

    },
    mounted() {
        mainApp.validaAcceso().then(res => {
            this.getReporte(true, 1, true);
        })


        mainApp.getMenu().then(res => {
            mainApp.setBanner(93, 'mainBg', 'divBanner');
          
        }).catch(err => {
            validError(err);
        });

        window.onresize = () => {
            this.getPreview();
        }
    }
}).mount('#appEstadosCuenta')

