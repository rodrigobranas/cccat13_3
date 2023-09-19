import CpfValidator from "../../domain/CpfValidator";
import AccountDAO from "../repository/AccountDAO";
import MailerGateway from "../../infra/gateway/MailerGateway";
import Account from "../../domain/Account";

export default class Signup {
	cpfValidator: CpfValidator;
	mailerGateway: MailerGateway;

	constructor (readonly accountDAO: AccountDAO) {
		this.cpfValidator = new CpfValidator();
		this.mailerGateway = new MailerGateway();
	}

	async execute (input: Input) {
		const existingAccount = await this.accountDAO.getByEmail(input.email);
		if (existingAccount) throw new Error("Account already exists");
		const account = Account.create(input.name, input.email, input.cpf, input.isPassenger, input.isDriver, input.carPlate);
		await this.accountDAO.save(account);
		await this.mailerGateway.send(account.email, "Verification", `Please verify your code at first login ${account.verificationCode}`);
		return {
			accountId: account.accountId
		}
	}
}

type Input = {
	name: string,
	email: string,
	cpf: string,
	isPassenger: boolean,
	isDriver: boolean,
	carPlate: string
}
