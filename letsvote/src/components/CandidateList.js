import React, { Component } from 'react';

import VotingContract from '../../build/contracts/Voting.json'
import getWeb3 from '../utils/getWeb3'
import Candidate from './Candidate';

class CandidateList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            web3: null,
            completeWeb3: null,
            allCandidates: []
        }
    }

    componentWillMount() {
        getWeb3.then(results => {
            this.setState(() => ({
                web3: results.web3,
                completeWeb3: results
            }))
            this.instantiateContract()
        }).catch(() => {
            console.log('Error finding web3.')
        })
    }

    instantiateContract() {
        let votingContractInstance;
        const contract = require('truffle-contract')
        const votingContract = contract(VotingContract)
        votingContract.setProvider(this.state.web3.currentProvider)
        // Get accounts.
        this.state.web3.eth.getAccounts((error, accounts) => {
            votingContract.deployed().then((instance) => {
                votingContractInstance = instance
                // Stores a given value, 9 by default.
                return votingContractInstance.getAllCandidates.call();
            }).then((result) => {
                // Get the value from the contract to prove it worked.
                this.setState(() => ({
                    allCandidates: result
                }));
            })
        })
    }

    render() {
        return (
            <div>
                {this.state.allCandidates.map((candidate) => {
                    return (
                        <div key={Math.random()} className="col-md-3 col-sm-6 col-xs-6">
                            <Candidate candidateName={candidate} />
                        </div>
                    )
                })}
            </div>
        );
    }
}

export default CandidateList;