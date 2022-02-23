import mockStore from "../__mocks__/store"
import {fireEvent, screen} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Store from "../app/Store";


jest.mock("../app/store", () => mockStore)


const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({pathname});
};

describe("Given I am connected as an employee", () => {
    beforeEach(() => {

        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        );

        Object.defineProperty(window, "location", {
            value: {
                hash: ROUTES_PATH["NewBill"],
            },
        });

    });

    describe("When I navigate to the newbill page, and I want to post an PNG file", () => {
        test("Then function handleChangeFile should be called", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            };
            const newBill = new NewBill({
                document,
                onNavigate,
                store: Store,
                localStorage: window.localStorage
            });
            const spyHandle = jest.fn(newBill => 'handleChangeFile')
            const file = screen.getByTestId("file");
            file.addEventListener("change", spyHandle)

            userEvent.upload(file, new File(["image"], "test.png", {type: "image/png"}));
            expect(spyHandle).toHaveBeenCalled()
            expect(file.files[0].value).not.toBe("")

        });
    })

    describe("When I navigate to the newbill page, and I want to post an PDF file", () => {
        test("Then function handleChangeFile should be called", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            };
            const newBill = new NewBill({
                document,
                onNavigate,
                store: Store,
                localStorage: window.localStorage
            });
            const spyHandle = jest.fn(newBill => 'handleChangeFile')
            const file = screen.getByTestId("file")
            file.addEventListener("change", spyHandle)

            fireEvent.change(file, new File(["image"], "test.pdf", {type: "image/pdf"}));
            expect(spyHandle).toHaveBeenCalled()
            expect(file.files.length).toBe(0)
        });
    })
    describe("When I navigate to the newbill page, and I fill the form", () => {
        test("Then the function handleSubmit is called", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            const store = null
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            };

            const newBill = new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });

            const testBill = {
                id: "ZeKy5Mo4jkmdfPGYpTxB",
                vat: "",
                amount: 100,
                name: "test",
                fileName: "tester",
                commentary: "ceci est un test",
                pct: 20,
                type: " Services en ligne",
                email: "test@test.com",
                fileUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
                date: "2022-01-18",
                status: "pending",
                commentAdmin: "test",
            };

            screen.getByTestId("expense-type").value = testBill.type;
            screen.getByTestId("expense-name").value = testBill.name;
            screen.getByTestId("amount").value = testBill.amount;
            screen.getByTestId("datepicker").value = testBill.date;
            screen.getByTestId("vat").value = testBill.vat;
            screen.getByTestId("pct").value = testBill.pct;
            screen.getByTestId("commentary").value = testBill.commentary;
            newBill.fileUrl = testBill.fileUrl;
            newBill.fileName = testBill.fileName;

            const submitFormNewBill = screen.getByTestId("form-new-bill");
            expect(submitFormNewBill).toBeTruthy();

            const mockHandleSubmit = jest.fn(newBill.handleSubmit);
            submitFormNewBill.addEventListener("submit", mockHandleSubmit);
            fireEvent.submit(submitFormNewBill);

            const mockCreateBill = jest.fn(newBill.updateBill);
            submitFormNewBill.addEventListener("submit", mockCreateBill);
            fireEvent.submit(submitFormNewBill);

            expect(mockHandleSubmit).toHaveBeenCalled();
            expect(mockCreateBill).toHaveBeenCalled();

            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
        })

    })
})

describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
      test("fetches bills from mock API POST", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        };
        const newBill = new NewBill({
            document,
            onNavigate,
            mockStore,
            localStorage: window.localStorage,
        });
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
        const spy = jest.spyOn(newBill, 'handleSubmit')
        const formNewBill = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        formNewBill.addEventListener('submit', handleSubmit)
        fireEvent.submit(formNewBill)
        expect(spy).toHaveBeenCalled()
        const billsContent = screen.getByTestId('tbody') 
        expect(billsContent).toBeTruthy()
      })  
      test("post bills  via an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
            return {
                post: (data) => {
                    Promise.resolve({
                      data: [data]
                    })
                }
          }
        })
        mockStore.post.mockImplementationOnce(() =>
          Promise.reject(new Error("Erreur 404"))
        )
        const html = BillsUI({ error: "Erreur 404" })
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
    })
    
  })
  