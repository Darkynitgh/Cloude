


mainApp.getMenu().then(res => {
    mainApp.setBanner(83, 'mainBg', 'divBanner');
}).catch(err => {
    validError(err);
})