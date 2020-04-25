import { AxiosInstance, AxiosResponse } from "axios";

// 1

export type Item = { id: string; description: string };

export type Handler<I> = (input: I) => Promise<Item>;

export type HttpHandler<I, O = AxiosInstance> = (httpClient: O) => Handler<I>;

export async function responseBody<T>(
  fn: Promise<AxiosResponse<T>>
): Promise<T> {
  return fn.then((response) => response.data);
}

// 2

export type PenInput = { color: "black" | "blue" };

export const penHandler: HttpHandler<PenInput> = (httpClient) => (input) =>
  responseBody(httpClient.post("/pen", input));

export type NotebookInput = { size: number };

export const notebookHandler: HttpHandler<NotebookInput> = (httpClient) => (
  input
) => responseBody(httpClient.post("/notebook", input));

// 3

export type Items = "pen" | "notebook";

export type Handlers = PenInput | NotebookInput;

export type Inventory = { [item in Items]: HttpHandler<keyof Handlers> };

export type ItemRequest = { name: string; input: unknown };

export type GenericItemHandler = HttpHandler<any, AxiosInstance>;

export class Salesperson {
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
