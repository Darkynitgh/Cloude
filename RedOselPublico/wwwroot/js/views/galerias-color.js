

Vue.createApp({
    data() {
        return {
            array: {
                galerias: []
            }
        }
    },
    methods: {
        getGalerias() {
            setLoader();
            axios.post(`${url}RedOsel/GaleriasColorConsulta`, {
                idTipoMultimedia: 10,
                idOrigen: 0
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.galerias = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_alta).toFormat('dd-MMM-yyyy'),
                            ruta: document.location.origin + '/admin/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo
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
            mainApp.setBanner(107, 'mainBg', 'divBanner');
            this.getGalerias();
        }).catch(err => {
            validError(err);
        });
    
    }
}).mount('#appGaleriasColor')