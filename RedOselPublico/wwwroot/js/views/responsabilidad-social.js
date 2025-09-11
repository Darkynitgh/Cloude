



Vue.createApp({
    data() {
        return {
            array: {
                organizaciones: []
            },
            htmlOrganizacion: '',
            tituloOrganizacion: '',
            srcImagen: ''
        }
    },
    methods: {
        getRes() {
            setLoader();
            axios.post(`${url}RedOsel/ResponsabilidadSocialConsulta`, {
                nombre: '',
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.organizaciones = res.data?.map(i => {
                        return {
                            ...i,
                            srcMini: document.location.origin + '/RedOsel/archivos/multimedia/responsabilidad-social/' + i.logo_mini,
                            src: document.location.origin + '/RedOsel/archivos/multimedia/responsabilidad-social/' + i.logo,
                            active: false
                        };
                    })

                    let chunks = 5;
                    if (window.screen.width < 510) {
                        chunks = 2;
                    }
                    if (window.screen.width > 510 && window.screen.width <= 768) {
                        chunks = 3;
                    }
                    if (window.screen.width > 768 && window.screen.width <= 1100) {
                        chunks = 4;
                    }


                    this.array.organizaciones = this.chunkArray(this.array.organizaciones, chunks);
                    //this.verOrganizacion(this.array.organizaciones[0][0]);
                }

                console.log(this.array.organizaciones);
                setLoader('hide')
            }).catch(err => validError(err))
        },
        chunkArray(array, chunkSize) {
            const newArray = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                // Extract a chunk of size `chunkSize` and push it to the new array
                newArray.push(array.slice(i, i + chunkSize));
            }
            return newArray;
        },
        verOrganizacion(item) {
            this.array.organizaciones.forEach(i => {
                i.active = false;
            });

            this.srcImagen = item.srcMini;
            item.active = true;
            this.tituloOrganizacion = item.nombre;
            this.htmlOrganizacion = item.descripcion;
            this.link = item.url;

            setTimeout(_ => {
                var a = document.getElementById('refFocus');
                a.scrollIntoView();
            }, 50);
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(63, 'mainBg', 'divBanner');
            this.getRes();
        }).catch(err => {
            validError(err);
        });      

        window.onresize = () => {
            if (window.screen.width > 768) {
                this.getRes();
            }
       
        }
    }
}).mount('#appResponsabilidadSocial')


carousel = true;