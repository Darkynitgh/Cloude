



Vue.createApp({
    data() {
        return {
            array: {
                videos: []
            }, 
            urlVideo: '',
            mostrar: false,
            tituloVideo: ''
        }
    },
    methods: {
        getVideos() {
            setLoader();
            this.array.videos = [];

            axios.post(`${url}RedOsel/VideoConsulta`, {
                descripcion: '',
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    var arraySource = res?.data?.map(i => {
                        return {
                            ...i,
                            active: false
                        }
                    });

                    let chunks = 5;
                    if (window.screen.width >= 768 && window.screen.width <= 1110) {
                        chunks = 3;
                    }
                    if (window.screen.width < 768) {
                        chunks = 2;
                    }
                    var array2 = JSON.parse(JSON.stringify(this.chunkArray(arraySource, chunks)));
                    this.array.videos = array2;

                    this.array.videos.forEach(i => {
                        i.forEach(a => {
                            a.src = document.location.origin + '/RedOsel/archivos/multimedia/' + a?.multimedia[0]?.id_tipo_multimedia + '/' + a?.multimedia[0]?.archivo;
                            a.active = false;
                        })
                    });


                    if (this.array.videos.length > 0) {
                        this.mostrar = true;
                        setTimeout(_ => {
                            this.array.videos[0][0].active = true;
                            this.urlVideo = this.array.videos[0][0].url_video;
                            this.tituloVideo = this.array.videos[0][0].titulo;
                        }, 0)
                    }


                    
                }
                setLoader('hide');
            }).catch(err => validError(err));
        },
        chunkArray(array, chunkSize) {
            const newArray = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                // Extract a chunk of size `chunkSize` and push it to the new array
                newArray.push(array.slice(i, i + chunkSize));
            }
            return newArray;
        },
        verVideo(evt, item) {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            this.mostrar = false;

            setLoader();

            setTimeout(_ => {
                this.mostrar = true;
            }, 50)

            setTimeout(_ => {
                this.urlVideo = '';
            }, 50)

            setTimeout(_ => {

                setLoader('hide');
                this.array.videos.forEach(i => {
                    i.forEach(a => {
                        a.active = false;
                    })
                });


                this.tituloVideo = item.titulo;
                item.active = true;
                this.urlVideo = item.url_video;
            }, 100)
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(59, 'mainBg', 'divBanner');
            this.getVideos();

            window.onresize = () => {
                if (window.screen.width > 768) {
                    this.getVideos();
                }
               
            } 
        }).catch(err => {
            validError(err);
        });    
    }
}).mount('#appVideos')


carousel = true;