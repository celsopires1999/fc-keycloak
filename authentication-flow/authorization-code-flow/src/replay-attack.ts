const url =
"http://localhost:3000/callback?session_state=f3682900-90ae-4f3f-badc-f3ffb4fb0eee&code=eee82292-82f7-4184-bbd3-e2b4a341e8ee.f3682900-90ae-4f3f-badc-f3ffb4fb0eee.ff2f502b-1904-412b-9fc5-f5b29aea7574"

const request1 = fetch(url);
const request2 = fetch(url);

Promise.all([request1, request2])
  .then(async (responses) => {
    return Promise.all(responses.map((response) => response.json()));
  })
  .then((jsons) => console.log(jsons));
