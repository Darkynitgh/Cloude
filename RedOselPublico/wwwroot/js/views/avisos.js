
let modalPrincipal;

Vue.createApp({
    data() {
        return {
            array: {
                avisos: []
            },
            show: {
                video: false
            },
            srcVideo: '',
            descripcionAviso: '',
            nombre: '',
            apellidos: '',
        }
    },
    methods: {
        getAvisos() {
            setLoader();
            axios.post(url + 'RedOsel/AvisoConsulta', {
                descripcion: '',
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.avisos = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromFormat(i.fecha, 'yyyy-MM-dd').toFormat('dd-MMM-yyyy')
                        };
                    });

                    var principal = res.data?.some(a => a.avisoPrincipal) ? res.data.find(a => a.avisoPrincipal) : null;
                    if (principal !== null) {
                        this.setPrincipal(principal);
                    }
                }
             
                setLoader('hide');
                this.nombre = mainApp.nombre;
                this.apellidos = mainApp.apellidos;
            }).catch(err => validError(err));
        },
        setPrincipal(item) {
            if (item.link) {
                if (item.avisoPrincipal || item.video) {
                    this.show.video = true;
                    this.srcVideo = item.urlMedia;
                    this.descripcionAviso = item.descripcion;
                    modalPrincipal.show();
                } else {
                    this.srcVideo = item.urlMedia;
                }
            } else {
                if (item.multimedia.length > 0) {
                    if (item.multimedia.some(i => i.archivo?.toLowerCase().includes('.pdf'))) {
                        var archivo = item.multimedia?.find(i => i.archivo?.toLowerCase().includes('.pdf'))
                        this.descripcionAviso = item?.descripcion;
                        this.srcVideo = document.location.origin + '/RedOsel/archivos/multimedia/' + archivo.id_tipo_multimedia + '/' + archivo?.archivo;


                        modalPrincipal.show();

                    }
                }
            }
        },
        verArchivo(evt, i) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            window.open(document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo, '_blank');
        },
        descargar(i) {
            let anchor = document.createElement('a');
            anchor.href = document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo;
            anchor.download = '';
            anchor.setAttribute('download', '');
            anchor.target = '_blank';
            anchor.click();
            anchor.remove();
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(61, 'mainBg', 'divBanner');
            this.getAvisos();
            modalPrincipal = new bootstrap.Modal(this.$refs.modalPrincipal);
        }).catch(err => {
            validError(err);
        });   
    }
}).mount('#appAvisos');

