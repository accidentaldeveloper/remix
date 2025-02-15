import { createFixture, js } from "./helpers/create-fixture";
import type { Fixture } from "./helpers/create-fixture";

let fixture: Fixture;

beforeAll(async () => {
  fixture = await createFixture({
    files: {
      "app/routes/index.jsx": js`
        import { json } from "@remix-run/node";

        export async function action({ request }) {
          try {
            await request.formData()
          } catch (err) {
            return json("no pizza");
          }
          return json("pizza");
        }
      `,
    },
  });
});

it("invalid content-type does not crash server", async () => {
  let response = await fixture.requestDocument("/", {
    method: "post",
    headers: { "content-type": "application/json" },
  });
  expect(await response.text()).toMatch("no pizza");
});

it("invalid urlencoded body does not crash server", async () => {
  let response = await fixture.requestDocument("/", {
    method: "post",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "$rofl this is totally invalid$",
  });
  expect(await response.text()).toMatch("pizza");
});

it("invalid multipart content-type does not crash server", async () => {
  let response = await fixture.requestDocument("/", {
    method: "post",
    headers: { "content-type": "multipart/form-data" },
    body: "$rofl this is totally invalid$",
  });
  expect(await response.text()).toMatch("pizza");
});

it("invalid multipart body does not crash server", async () => {
  let response = await fixture.requestDocument("/", {
    method: "post",
    headers: { "content-type": "multipart/form-data; boundary=abc" },
    body: "$rofl this is totally invalid$",
  });
  expect(await response.text()).toMatch("pizza");
});
