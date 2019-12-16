class BiochemistryAPI {

  constructor() {
    this.database_modules = {}
  }

  get_compound(id, database, fn_success) {
    console.log(id, database);
    if (!database) {
      database = this.detect_database(id);
    }

    if (database && this.database_modules[database]) {
      console.log('get_compound', id, database);
      this.database_modules[database].get_compound(id, database, fn_success)
    }
  }

  detect_database(id) {
    if (id.substring(0, 3) === 'cpd') {
      return 'seed.compound'
    }

    return null;
  }
}