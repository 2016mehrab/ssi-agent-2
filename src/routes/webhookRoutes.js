const url = "http://127.0.0.1:8021";
const ngrok_url = "http://127.0.0.1:4040/api/tunnels";
const my_server = "http://127.0.0.1:3001";
const axios = require("axios");
const routes = (app) => {
  app
    .route("/connections")
    .get(async (req, res) => {
      try {
        let response = await axios.get(url + "/connections");
        // let connection_ids = response.data.results.map((e) => e.connection_id);

        res.status(202).send(response.data);
      } catch (error) {
        console.log(error.message);
      }
    })
    .delete(async (req, res) => {
      try {
        let response = await axios.get(url + "/connections");
        let connection_ids = response.data.results.map((e) => e.connection_id);
        console.log(connection_ids);

        // delete all connections
        connection_ids.map(async (e) => {
          response = await axios.delete(url + "/connections/" + e);
          if (response.status !== 200)
            throw Error("Could not delete connection");
        });

        res
          .status(202)
          .send(`Method- ${req.method} Endpoint- ${req.originalUrl}`);
      } catch (error) {
        console.log(error.message);
      }
    });
  

  app.route("/webhook")
  .post(async(req,res)=>{
    try{
      let url_string=url+"/connections/receive-invitation?auto_accept=true&alias="+req.body.label;
      console.log(`Request Body`, req.body);
      console.log();
      console.log('url string', url_string);
    let response = await axios.post(url_string, req.body, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    res.status(202).json(response.data);
    
    }

    catch(error){
      console.log(error.message);
      
    }
  });
	 app
    .route("/issue-credential")
    .get(async (req, res) => {
      try {
        const response = await axios.get(url + "/issue-credential-2.0/records");
        let cred_records = response.data.results;
        console.log(cred_records);

        cred_records.forEach((item) => {
          delete item.cred_ex_record.cred_offer;
          delete item.cred_ex_record.cred_proposal;
          delete item.cred_ex_record.by_format;
          delete item.indy;
          delete item.ld_proof;
        });
        res.status(200).json(cred_records);
      } catch (e) {
        console.log(e.message);
        res.status(500).json(e.message);
      }
    })
    .post(async (req, res) => {
      let response;
      try {
        response = await axios.get(my_server + "/connections");

        // res.status(200).json(data);
      } catch (e) {
        // res.status(500).json({ message: "problem while getting connections" });
        res.status(500).json({ message: e.message });
      }
      // TODO: fix replacement_id & connection_id
      let data = {
        auto_issue: true,
        auto_remove: true,
        comment: "string",
        connection_id: response.data.results[0].connection_id,
        credential_preview: {
          "@type": "issue-credential/2.0/credential-preview",
          attributes: [...req.body.attrs],
        },
        filter: {
          indy: {
            cred_def_id: req.body.indy_field.cred_def_id,
            issuer_did: req.body.indy_field.issuer_did,
            schema_id: req.body.indy_field.schema_id,
            schema_issuer_did: req.body.indy_field.schema_issuer_did,
            schema_name: req.body.indy_field.schema_name,
            schema_version: req.body.indy_field.schema_version,
          },
        },
        replacement_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        trace: true,
      };

      try {
        response = await axios.post(
          url + "/issue-credential-2.0/send-offer",
          data,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        res.status(200).json(response.data);
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    })

    // delete all credential exchange record
    .delete(async (req, res) => {
      try {
        let response = await axios.get(url + "/issue-credential-2.0/records");
        let cred_ex_ids = response.data.results.map(
          (e) => e.cred_ex_record.cred_ex_id
        );
        console.log(cred_ex_ids);
        cred_ex_ids.map(async (e) => {
          response = await axios.delete(
            url + "/issue-credential-2.0/records/" + e
          );
          if (response.status !== 200)
            throw Error("Could not delete connection");
        });
        res
          .status(202)
          .send(`Method- ${req.method} Endpoint- ${req.originalUrl}`);
      } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
      }
    });

  app
    .route("/credentials")
    // get all credentials
    .get(async (req, res) => {
      try {
        let response = await axios.get(url + "/credentials");
        res.status(200).json(response.data.results);
      } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
      }
    })
    .delete(async (req, res) => {
      try {
        let response = await axios.get(url + "/credentials");
        let cred_ids = response.data.results.map((e) => e.referent);
        cred_ids.map(async (e) => {
          response = await axios.delete(url + "/credential/" + e);
          if (response.status !== 200)
            throw Error("Could not delete connection");
        });
        res
          .status(202)
          .send(`Method- ${req.method} Endpoint- ${req.originalUrl}`);
      } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
      }
    });
	  app
    .route("/present-proof")
    // get all records
    .get(async (req, res) => {
      try {
        const response = await axios.get(url + "/present-proof-2.0/records");
        let proof_records = response.data.results;
        // console.log(proof_records);

        proof_records.forEach((item) => {
          delete item.pres_ex_proposal;
          delete item.verified_msgs;
          delete item.auto_present;
          delete item.auto_remove;
          delete item.by_format;
          delete item.error_msg;
          delete item.thread_id;
          delete item.pres_request;
          delete item.pres;
        });
        res.status(200).json(proof_records);
      } catch (e) {
        console.log(e.message);
        res.status(500).json(e.message);
      }
    })
    // request proof
    .post(async (req, res) => {
      let response;
      try {
        response = await axios.get(my_server + "/connections");

        // res.status(200).json(data);
      } catch (e) {
        // res.status(500).json({ message: "problem while getting connections" });
        res.status(500).json({ message: e.message });
      }
      // TODO: fix replacement_id & connection_id
      let data = {
        auto_verify: false,
        auto_remove: true,
        comment: "string",
        connection_id: response.data.results[0].connection_id,
        presentation_request: {
          indy: {
            non_revoked: {
              from: 1640995199,
              to: 1640995199
            },
            name: "Proof Request",
            nonce: "1",
            requested_attributes: {
              additionalProp1: {
                name: req.body.attr_name,
                value: req.body.attr_val,
                restriction: [
                  {
                    schema_name: req.body.schema_name,
                  }
                ]
              }
            },
            requested_predicates: {},
            version:"1.0"
          }
        },
        trace: true,
      };

      try {
        response = await axios.post(
          url + "/present-proof-2.0/send-request",
          data,
          {
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        res.status(200).json(response.data);
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    })

    // delete all proofs-presentation exchange record
    .delete(async (req, res) => {
      try {
        let response = await axios.get(url + "/present-proof-2.0/records");
        let pres_ex_ids = response.data.results.map(
          (e) => e.pres_ex_id
        );
        pres_ex_ids.map(async (e) => {
          response = await axios.delete(
            url + "/present-proof-2.0/records/" + e
          );
          if (response.status !== 200)
            throw Error("Could not delete record");
        });
        res
          .status(202)
          .send(`Method- ${req.method} Endpoint- ${req.originalUrl}`);
      } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
      }
    });


    app.route("/send-proof")   .post(async (req, res) => {
      let response;
      try {
        response = await axios.get(my_server + "/connections");

        // res.status(200).json(data);
      } catch (e) {
        // res.status(500).json({ message: "problem while getting connections" });
        res.status(500).json({extra:"connections problem" ,message: e.message });
      }
      // TODO: fix replacement_id & connection_id
      let proof=
      {
        "auto_remove": true,
        "dif": {
          "reveal_doc": {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://w3id.org/security/bbs/v1"
            ],
            "@explicit": true,
            "@requireAll": true,
            "credentialSubject": {
              "@explicit": true,
              "@requireAll": true,
              "Observation": [
                {
                  "effectiveDateTime": {},
                  "@explicit": true,
                  "@requireAll": true
                }
              ]
            },
            "issuanceDate": {},
            "issuer": {},
            "type": [
              "VerifiableCredential",
              "LabReport"
            ]
          }
        },
        "indy": {
          "requested_attributes": {
            "additionalProp1": {
              "cred_id": req.body.cred_id,
              "revealed": true
            }

          },
          "requested_predicates": {
          },

          "self_attested_attributes": {
          },
          "trace": true
        },
        "trace": true
      }


	    let endpoint_url= 
          url + `/present-proof-2.0/records/${req.body.pres_ex_id}/send-presentation`;
	    console.log(endpoint_url);

      try {
        response = await axios.post(
          url + `/present-proof-2.0/records/${req.body.pres_ex_id}/send-presentation`,
         JSON.stringify(proof) ,
          {
            headers: {
              accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        res.status(200).json(response.data);
      } catch (e) {
        res.status(500).json({extra:"sending presentation problem" ,message: e.message });
      }
    })
	    app.route("/verify")   .post(async (req, res) => {

      let response;
      let pres_ex_id;
      try{

        response = await axios.get(my_server + "/present-proof");
        pres_ex_id=response.data[0].pres_ex_id;

      }
      catch(e){
        res.status(500).json({ message: e.message });
      }
      try {
        response = await axios.post(
          url + `/present-proof-2.0/records/${pres_ex_id}/verify-presentation`,
          {
            headers: {
              "accept": "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        res.status(200).json(response.data.verified);
      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    })


    app.route("/public-did").get(async(req,res)=>{
      let response;
      try{

        response = await axios.get(url + "/wallet/did/public");
        res.status(200).json(response.data.result);

      }
      catch(e){
        res.status(500).json({ message: e.message });
      }

    })
}
module.exports= routes;
