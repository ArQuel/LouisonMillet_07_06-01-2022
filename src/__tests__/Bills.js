/**
 * @jest-environment jsdom
 */
import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import Bills from "../containers/Bills.js"
import userEvent from "@testing-library/user-event"
import store from "../__mocks__/store"
import router from '../app/Router.js'
import { localStorageMock } from "../__mocks__/localStorage.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)
      
      const icone = screen.getByTestId('icon-window')
      expect(icone.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test nouvelle bill page
    describe("When I click on the new bill's button", () => {
      test("should renders new bill page", () => {
         // Pourquoi ?
        screen.debug()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const bills = new Bills({ document, onNavigate, store, localStorage })
        
        const handleClickNewBill = jest.fn((e) => bills.handleClickNewBill(e))
        const addnewBill = screen.getByTestId('btn-new-bill')
        
        addnewBill.addEventListener("click", handleClickNewBill)
  
        userEvent.click(addnewBill);
  
        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.queryByText('Envoyer une note de frais')).toBeTruthy()
      });
    })

    // Test de la modale
    describe("When I click on icon eye", () => {
      test("modal open correctly", () => {
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }
      // Pourquoi ?
      document.body.innerHTML = BillsUI({ data: bills })
      const bills2 = new Bills({ document, onNavigate: null, localStorage: window.localStorage })

      const handleClickIconEye = jest.fn(bills2.handleClickIconEye)

      const modale = document.getElementById("modaleFile")

      // Remplacer $.fn ?
      $.fn.modal = jest.fn(() => modale.classList.add('show'))

      const iconEyes = screen.getAllByTestId('icon-eye')
      const iconEye = iconEyes[1]

      iconEye.addEventListener('click', handleClickIconEye(iconEye))

      userEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled()
      expect(modale.classList).toContain('show')
      })
    })
  })
})
