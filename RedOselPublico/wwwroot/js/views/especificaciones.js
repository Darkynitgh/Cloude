



Vue.createApp({
    data() {
        return {
            array: {
                especificaciones: []
            }
        }
    },
    methods: {
        getEspecificaciones() {
            setLoader();
            axios.post(`${url}RedOsel/EspecificacionesConsulta`, {
                descripcion: '',
                orden: 1,
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.especificaciones = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_creacion).toFormat('dd-MMM-yyyy'),
                            multimedia: i?.multimedia?.map(a => {
                                return {
                                    ...a,
                                    ruta: document.location.origin + '/RedOsel/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.archivo
                                }
                            })?.filter(i => i.id_tipo_multimedia !== 4),
                            logo: document.location.origin + '/RedOsel/archivos/multimedia/' + i.multimedia?.find(i => i?.id_tipo_multimedia === 4)?.id_tipo_multimedia + '/' + i.multimedia?.find(i => i?.id_tipo_multimedia === 4)?.archivo
                        };
                    })
                    //    .sort((a, b) => {
                    //    return luxon.DateTime.fromISO(b.fecha_alta) - luxon.DateTime.fromISO(a.fecha_alta);
                    //})
                }
                setLoader('hide')
            }).catch(err => validError(err))
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
            mainApp.setBanner(67, 'mainBg', 'divBanner');
            this.getEspecificaciones();
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appEspecificaciones')