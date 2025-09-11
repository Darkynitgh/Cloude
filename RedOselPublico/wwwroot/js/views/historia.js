


mainApp.getMenu().then(res => {
    mainApp.setBanner(99, 'mainBg', 'divBanner');
    setLoader('hide');
}).catch(err => {
    validError(err);
});
