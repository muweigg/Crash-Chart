const Mock = require('mockjs');

module.exports = {
    "profile": {
        "name": "Mu Wei"
    },
    comments: Mock.mock({
        "status": "success",
        "message": "",
        "result|100": [{
            "id|+1": 1,
            "author": "@name",
            "comment": "@cparagraph",
            'date|+1' () {
                let now = new Date('2018-01-00');
                now.setTime(now.getTime() - (-this.id) * 24 * 60 * 60 * 1000);
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const day = now.getDate();
                return `${year<10?0:''}${year}-${month<10?0:''}${month}-${day<10?0:''}${day}`;
            }
        }]
    })
}