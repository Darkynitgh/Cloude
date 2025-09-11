



Vue.createApp({
    data() {
        return {
            array: {
                dicos: []
            }
        }
    },
    methods: {
        getDicos() {
            setLoader();
            axios.post(`${url}RedOsel/DicoConsulta`, {
                nombre: '',
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.dicos = res.data?.map(i => {
                        return {
                            ...i,
                            src: document.location.origin + '/RedOsel/archivos/multimedia/dicopint/' + i.logo
                        };
                    })

                    setTimeout(_ => {
                        startToolTips();
                    }, 100)
                }

             
                setLoader('hide')
            }).catch(err => validError(err))
        },
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(70, 'mainBg', 'divBanner');
            this.getDicos();
        }).catch(err => {
            validError(err);
        });

    }
}).mount('#appDico')