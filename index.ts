import { AxiosInstance, AxiosResponse } from "axios";

// 1

export type Item = { id: string; description: string };

export type Handler<I> = (input: I) => Promise<Item>;

export type HttpHandler<I, O = AxiosInstance> = (httpClient: O) => Handler<I>;

export async function requestBody<T>(
  fn: Promise<AxiosResponse<T>>
): Promise<T> {
  return fn.then((response) => response.data);
}

// 2

export type PenInput = { color: "black" | "blue" };

export const penHandler: HttpHandler<PenInput> = (httpClient) => (input) =>
  requestBody(httpClient.post("/pen", input));

export type NotebookInput = { size: number };

export const notebookHandler: HttpHandler<NotebookInput> = (httpClient) => (
  input
) => requestBody(httpClient.post("/notebook", input));

// 3

export type Items = "pen" | "notebook";

export type Handlers = PenInput | NotebookInput;

export type Inventory = { [item in Items]: HttpHandler<keyof Handlers> };

export type ItemRequest<T> = { name: Items; input: T };

export class Salesperson {
  public constructor(
    private inventory: Inventory,
    private httpClient: AxiosInstance
  ) {}

  private isKnownItem(name: string): boolean {
    const itemFound = Object.keys(this.inventory).find((item) => item === name);

    return itemFound !== undefined;
  }

  public async sell<T>(request: ItemRequest<T>): Promise<Item> {
    if (this.isKnownItem(request.name)) {
      const handler = this.inventory[request.name](this.httpClient);

      // @ts-ignore
      return await handler(request.input);
    }

    throw Error("unknown item");
  }
}
