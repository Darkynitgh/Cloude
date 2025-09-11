
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
        verMas(item) {
            modalDetalle.show();

            this.array.formulas = [];
            this.tituloReformula = item.nombre;
            this.descripcionReformula = item.descripcion;

            if (item.multimedia.length > 0) {         

                this.array.formulas = item.multimedia.map(i => {
                    return {
                        ...i,
                        href: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo
                    }
                })
            }
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(106, 'mainBg', 'divBanner');
            this.getReformulaciones();
            modalDetalle = new bootstrap.Modal(this.$refs.modalDetalle);
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appReformulas')