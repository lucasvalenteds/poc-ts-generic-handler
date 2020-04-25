import Axios, { AxiosInstance } from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { Inventory, penHandler, notebookHandler, Store, Item } from "./";

const httpClient: AxiosInstance = Axios.create();

const mock: AxiosMockAdapter = new AxiosMockAdapter(httpClient);

const inventory: Inventory = {
  pen: penHandler,
  notebook: notebookHandler,
};

const store = new Store(inventory, httpClient);

const mockPen: Item = {
  id: "1",
  description: "Pen description",
};

const mockNotebook: Item = {
  id: "2",
  description: "Notebook description",
};

test("Selling one black pen", async () => {
  mock.onPost("/pen").reply(200, mockPen);

  const item = await store.sell({
    name: "pen",
    input: {
      color: "black",
    },
  });

  expect(item).toStrictEqual(mockPen);
});

test("Selling one medium book", async () => {
  mock.onPost("/notebook").reply(200, mockNotebook);

  const item = await store.sell({
    name: "notebook",
    input: {
      size: 2,
    },
  });

  expect(item).toStrictEqual(mockNotebook);
});

test("Selling unknown item throws error", async () => {
  expect.assertions(1);
  mock.onPost("/book").reply(200);

  try {
    await store.sell({
      name: "laptop",
      input: {
        screenSize: 15.6,
      },
    });
  } catch (error) {
    expect(error.message).toStrictEqual("unknown item");
  }
});
