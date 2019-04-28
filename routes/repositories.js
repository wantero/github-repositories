const axios = require('axios');
const repository = require('../classes/repository');
const Contributors = require('../classes/contributors');

module.exports = {
    getRepoFromGitHub: (req, res) => {

        console.log('getRepoFromGitHub');

        axios.get('https://api.github.com/search/repositories?q=tetris+language:assembly&sort=stars&order=desc')
            .then(response => {
                // console.log(response.data);
                console.log(response.data.items.length);
 
                const result = response.data.items.map(repo => {
                    let myRepository = new repository(repo.id,
                                                repo.node_id,
                                                repo.name,
                                                repo.full_name,
                                                repo.private,
                                                repo.description,
                                                repo.language,
                                                repo.owner.login);
                    //console.log(myRepository);
                    // console.log(Object.values(myRepository));
                    let query = 'INSERT INTO repositories SET ?';
                    db.query(query, myRepository, (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }                        
                    });
    
                    //console.log(query);
                })

                res.redirect('/');
            })
            .catch(error => {
                console.log(error);
            });

    }
};
