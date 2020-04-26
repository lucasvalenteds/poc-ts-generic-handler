import { AxiosInstance, AxiosResponse } from "axios";

// ---

export type Item = { id: string; description: string };

export type Handler<T> = (input: T) => Promise<Item>;

export type HttpHandler<T, U = AxiosInstance> = (httpClient: U) => Handler<T>;

export async function responseBody<T>(
  fn: Promise<AxiosResponse<T>>
): Promise<T> {
  return fn.then((response) => response.data);
}

// ---

export type PenInput = { color: "black" | "blue" };

export const penHandler: HttpHandler<PenInput> = (httpClient) => (input) =>
  responseBody(httpClient.post("/pen", input));

export type NotebookInput = { size: number };

export const notebookHandler: HttpHandler<NotebookInput> = (httpClient) => (
  input
) => responseBody(httpClient.post("/notebook", input));

// ---

export type Items = "pen" | "notebook";

export type Handlers = PenInput | NotebookInput;

export type Inventory = { [item in Items]: HttpHandler<keyof Handlers> };

export type ItemRequest = { name: string; input: any };

export type GenericItemHandler = HttpHandler<any, AxiosInstance>;

export class Store {
  public constructor(
    private inventory: Inventory,
    private httpClient: AxiosInstance
  ) {}

  private isKnownItem(name: any): name is keyof Inventory {
    const itemFound = Object.keys(this.inventory).find((item) => item === name);

    return itemFound !== undefined;
  }

  public async sell(request: ItemRequest): Promise<Item> {
    if (this.isKnownItem(request.name)) {
      const itemHandler = this.inventory[request.name] as GenericItemHandler;

      return await itemHandler(this.httpClient)(request.input);
    }

    throw Error("unknown item");
  }
}
