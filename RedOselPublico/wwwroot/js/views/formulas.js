
let modalDetalle;

Vue.createApp({
    data() {
        return {
            array: {
                reformulas: [],
                formulas: []
            },
            tituloReformula: '',
            descripcionReformula: '',
            tituloModal: '',
            show: {
                reformulas: false,
                detalleReformulas: false,
                regresar: false
            }
        }
    },
    methods: {
        urlImage(item) {
            return `${url}imagenes/manuales/${item.banner_pagina}`;
        },
        urlContent(item) {
            return `${url}${item.url_destino}`;
        },
        verDetalle(opcion) {
            if (opcion === 1) {
                this.tituloModal = 'Reformulaciones';
                this.show.detalleReformulas = false;
                this.show.reformulas = true;
                this.show.regresar = false;
            }
            modalDetalle.show();
        },
        getReformulaciones() {
            setLoader();
            axios.post(`${url}RedOsel/ReformulacionesConsulta`, {
                nombre: '',
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.reformulas = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_actualizacion).toFormat('dd-MMM-yyyy'),
                        };
                    })
                }
                setLoader('hide')
            }).catch(err => validError(err));
        },
        regresar(opcion) {
            if (opcion === 1) {
                this.show.detalleReformulas = false;
                this.show.reformulas = true;
            }
        },
        verMas(item) {
            this.show.detalleReformulas = true;
            this.show.reformulas = false;
            this.show.regresar = true;

            this.array.formulas = [];
            this.tituloReformula = item.nombre;
            this.descripcionReformula = item.descripcion;

            if (item.multimedia.length > 0) {         

                this.array.formulas = item.multimedia.map(i => {
                    return {
                        ...i,
                        href: document.location.origin + '/admin/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo
                    }
                })
            }
        }
    },
    computed: {
        menu() {
            return mainApp.array?.recursos?.filter((item) => item.id === 98)?.[0]?.esferas;
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(98, 'mainBg', 'divBanner');
            //this.getReformulaciones();
            //modalDetalle = new bootstrap.Modal(this.$refs.modalContenido);
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appReformulas')