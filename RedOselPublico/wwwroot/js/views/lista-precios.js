

Vue.createApp({
    data() {
        return {
            array: {
                listaPrecios: []
            }
        }
    },
    methods: {
        verArchivo(evt, i) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            window.open(i.ruta, '_blank');
        },
        getPrecios() {
            setLoader();
            axios.post(`${url}RedOsel/ListaPrecioConsulta`, {
                nombre: ''
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.listaPrecios = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_creacion).toFormat('dd-MMM-yyyy'),
                            multimedia: i?.multimedia?.map(a => {
                                return {
                                    ...a,
                                    ruta: document.location.origin + '/admin/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.archivo,
                                    fecha: luxon.DateTime.fromFormat(a.fecha, 'yyyy-MM-dd').toFormat('dd-MMM-yyyy')
                                }
                            })
                        };
                    })
                    //    .sort((a, b) => {
                    //    return luxon.DateTime.fromISO(b.fecha_alta) - luxon.DateTime.fromISO(a.fecha_alta);
                    //})
                }
                setLoader('hide')
            }).catch(err => validError(err));
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(116, 'mainBg', 'divBanner');
            this.getPrecios();
        }).catch(err => {
            validError(err);
        });
        
    }
}).mount('#appListaPrecios')