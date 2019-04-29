const axios = require('axios');
const repository = require('../classes/repository');
const Contributors = require('../classes/contributors');

module.exports = {
    getRepoFromGitHub: (req, res) => {

        db.query("DELETE FROM repositories", (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }                        
            db.query("DELETE FROM contributors", (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                
                //Requisições para 5 linguagens fixo, pode ter refactory para receber via param e processar individualmente
                let myLanguages = new Array('javascript','java','python','r','go');

                myLanguages.map(language => {
                    axios.get('https://api.github.com/search/repositories?q=language:' + language + '&sort=stars&order=desc')
                    .then(response => {
        
                        const insert = response.data.items.map(repo => {
                            let myRepository = new repository(repo.id,
                                                        repo.node_id,
                                                        repo.name,
                                                        repo.full_name,
                                                        repo.private,
                                                        repo.description,
                                                        repo.language,
                                                        repo.owner.login,
                                                        repo.stargazers_count,
                                                        repo.forks,
                                                        repo.clone_url);
                            let query = 'INSERT INTO repositories SET ?';
                            db.query(query, myRepository, (err, result) => {
                                if (err) {
                                    //return res.status(500).send(err);
                                    console.log(err);
                                }                        
                            })
                        })
                        res.redirect('/');
                    })
                    .catch(error => {
                        console.log(error);
                    });
                });
            });                   
        });
    },
    infoRepoPage: (req, res) => {
        let owner  = req.params.owner;
        let repo   = req.params.repo;
        let repoId = req.params.repoId;
        
        let repository = new Array();
        let resultAux = new Array();
        let query;

        query = "SELECT * FROM `repositories` WHERE id = " + repoId;

        // execute query
        db.query(query, (err, result) => {
            if (err) {
                res.render('info-repo.ejs', {
                    title: "Repository Info"
                    ,repository: ''
                    ,contributors: ''
                    ,message: err
                });
            }
            if (result[0]) {
                repository.push(result[0]);
            } else {
                res.render('info-repo.ejs', {
                    title: "Repository Info"
                    ,repository: ''
                    ,contributors: ''
                    ,message: 'Repositório não encontrado!'
                });                
            }
            
        });        

        query = "SELECT * FROM `contributors` WHERE repoId = " + repoId;
        
        db.query(query, (err, result) => {

            if (result[0]) {
                res.render('info-repo.ejs', {
                    title: "Repository Info"
                    ,repository: repository[0]
                    ,contributors: result
                    ,message: ''
                });
            } else {
                axios.get('https://api.github.com/repos/' + owner + '/' + repo + '/contributors')
                .then(response => {
                    const result = response.data.map(contributors => {
                        let myContributors = new Contributors(repoId,
                                                              contributors.id,
                                                              contributors.node_id,
                                                              contributors.login,
                                                              contributors.avatar_url,
                                                              contributors.html_url,
                                                              contributors.contributions);
                        resultAux.push(myContributors);                        
                        let query = 'INSERT INTO contributors SET ?';
                        db.query(query, myContributors, (err, result) => {
                            if (err) {
                                console.log('erro ao inserir contributors.');
                            }                        
                        });
                    })

                    res.render('info-repo.ejs', {
                        title: "Repository Info"
                        ,repository: repository[0]
                        ,contributors: resultAux
                        ,message: ''
                    });
                })
                .catch(error => {
                    console.log('erro ao buscar contributors.');
                });                
            }
        });
    }
};
