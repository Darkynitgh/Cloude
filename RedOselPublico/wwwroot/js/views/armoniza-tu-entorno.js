

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
            axios.post(`${url}RedOsel/ArmonizaTuEntornoConsulta`, {
                idTipoMultimedia: 11,
                idOrigen: 0
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.galerias = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_alta).toFormat('dd-MMM-yyyy'),
                            ruta: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo
                        };
                    })
                }
                setLoader('hide')
            }).catch(err => validError(err));
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(71, 'mainBg', 'divBanner');
            this.getGalerias();
        }).catch(err => {
            validError(err);
        })       
    }
}).mount('#appArmonizaTuEntorno')