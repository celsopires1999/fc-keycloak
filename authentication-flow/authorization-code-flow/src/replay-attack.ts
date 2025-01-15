const url =
"http://localhost:3000/callback?session_state=e48cb863-3a51-4d18-9953-3bcb71d506af&code=44592ab1-d9c0-4eb5-b9d6-8880f070d6bb.e48cb863-3a51-4d18-9953-3bcb71d506af.ff2f502b-1904-412b-9fc5-f5b29aea7574"

const request1 = fetch(url);
const request2 = fetch(url);

Promise.all([request1, request2])
  .then(async (responses) => {
    return Promise.all(responses.map((response) => response.json()));
  })
  .then((jsons) => console.log(jsons));
