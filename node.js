const axios = require('axios');
const queryEncode = require("querystring").encode;

module.exports = function (RED) {
    function FunctionNode(n) {
        RED.nodes.createNode(this, n);

        var node = this;
        this.name = n.name;
        node.params = {};

        for (var key in n) {
            if (key !== 'x' && key !== 'y' && key !== 'z' && key !== 'creds' && key !== 'id'&& key !== 'type' && key !== 'wires' && key !== 'name'
                && n[key] !== ''&& typeof n[key] !== 'undefined') {
                if(key === 'currency_pair'){
                    node.params.currency = n[key];
                }
                node.params[key] = n[key] || "";
            }
        }

        this.on('input', function (msg) {
            if(msg.params){
                for (var i in msg.params) {
                    if (i !== 'req' && i !== 'res' && i !== 'payload' && i !== 'send' && i !== '_msgid' && i !== 'topic') {
                        node.params[i] = node.params[i] || msg.params[i];
                    }
                }
            }
            if(msg.accessToken){
                node.accessToken = msg.accessToken;
            }

            var url = 'https://api.korbit.co.kr/v1';
            if(node.params.api){
                url += '/' + node.params.api;
            }

            const options = {};
            const query = queryEncode(node.params);
            delete node.params.params;
            // node.error(url);
            node.error(node.params);

            if(node.params.api === 'user/balances' | node.params.api === 'user/accounts' |node.params.api === 'user/volume'
                | node.params.api === 'user/orders/open' | node.params.api === 'user/orders'| node.params.api === 'user/transactions'
                | node.params.api === 'user/transfers'| node.params.api === 'user/coins/status'){
                options.method = "GET";
                options.data = node.params;
                url += '?' + query;
            }else if(node.params.ord_type | node.params.api === 'user/orders/buy'| node.params.api === 'user/orders/sell'
                | node.params.api === 'user/orders/cancel'| node.params.api === 'user/coins/out'| node.params.api === 'user/coins/out/cancel'
                | node.params.api === 'user/coins/address/assign'){
                options.method = "POST"; // 주문하기 (주문 타입),코인 출금,원화 출금 등
                options.data = node.params;
            }else{
                options.method = "GET";
                url += '?' + query;
            }
            options.url = url;
            options.headers = {Authorization: `Bearer ${node.accessToken}`};
            node.error(url);

            axios(options).then(function (response) {
                msg.payload = response.data;
                node.send(msg);
            }).catch(function (error){
                msg.payload = error;
                node.send(msg);
            });

        });
    }

    RED.nodes.registerType("korbit", FunctionNode, {
    });


};

