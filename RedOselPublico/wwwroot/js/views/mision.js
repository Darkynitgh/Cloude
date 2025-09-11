


mainApp.getMenu().then(res => {
    mainApp.setBanner(100, 'mainBg', 'divBanner');
    setLoader('hide');
}).catch(err => {
    validError(err);
});
