import React, { Component } from 'react';

import Timer from './Timer';

import Election from '../../../build/contracts/Election.json';
import getWeb3 from '../../utils/getWeb3';

class Voters extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: null,
            candidateArray: [],
            message: undefined
        }
    }

    componentWillMount() {
        getWeb3.then(results => {
            this.setState({
                web3: results.web3
            })
            this.renderList();
        }).catch(() => {
            console.log('Error finding web3.')
        })
    }

    renderList = () => {
        let electionContractInstance;
        const contract = require('truffle-contract');
        const electionContract = contract(Election);
        electionContract.setProvider(this.state.web3.currentProvider);
        this.state.web3.eth.getAccounts((error, accounts) => {
            electionContract.deployed().then((instance) => {
                electionContractInstance = instance;
                return electionContractInstance.candidatesCount.call();
            }).then((count) => {
                // Candidate id is their index number hence for loop is
                // used to fetch canidate data and store in array.
                // Try to optimize this more ... But for now it works.
                for (let i = 1; i <= count; i++) {
                    electionContractInstance.candidates.call(i)
                        .then((result) => {
                            // Destructuring previous array and adding to last.
                            this.setState(() => ({
                                candidateArray: [...this.state.candidateArray, result[1]],
                            }));
                        });
                }
            })
        })
    }

    voteCandidate = (e, id) => {
        let electionContractInstance;
        const contract = require('truffle-contract');
        const electionContract = contract(Election);
        electionContract.setProvider(this.state.web3.currentProvider);
        this.state.web3.eth.getAccounts((error, accounts) => {
            electionContract.deployed().then((instance) => {
                electionContractInstance = instance;
                return electionContractInstance.vote(id, { from: accounts[0] });
            }).then((result) => {
                this.setState(() => ({ message: "Thank you for your vote." }));
                return electionContractInstance.candidatesCount.call();
            }).then((count) => {
                for (let i = 1; i <= count; i++) {
                    electionContractInstance.candidates.call(i)
                        .then((result) => {
                            console.log(result);
                        })
                }
            }).catch((error) => {
                console.log("error", error);
                this.setState(() => ({ message: "You can only vote once." }))
            })
        })
    }

    render() {
        return (
            <div>
                CandidateList
                <div>
                    {
                        this.state.candidateArray.map((candidate, i) => {
                            return (
                                <li key={i + 1}>
                                    {this.state.web3.toAscii(candidate).replace(/\u0000/g, '')}
                                    {
                                        (<button onClick={(e) => this.voteCandidate(e, i + 1)}>
                                            Vote
                                        </button>)
                                    }
                                </li>
                            );
                        })
                    }
                    {this.state.message}
                </div>
                <Timer />
            </div>
        );
    }
}

export default Voters;