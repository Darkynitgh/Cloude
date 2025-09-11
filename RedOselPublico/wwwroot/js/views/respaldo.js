



mainApp.getMenu().then(res => {
    mainApp.setBanner(101, 'mainBg', 'divBanner');
    setLoader('hide');
}).catch(err => {
    validError(err);
})