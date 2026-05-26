import { useState, useEffect, useRef } from "react";
import { Search, Plus, MoreHorizontal, Mail, ExternalLink, Upload, Lock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useTenant } from "../lib/TenantContext";
import { usePermissions } from "../lib/usePermissions";
import * as XLSX from "xlsx";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { activeTeam } = useTenant();
  const { canImportData } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Table features state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = async () => {
    if (!activeTeam) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/customers?teamId=${activeTeam.id}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    setSelectedRows([]);
    setCurrentPage(1);
  }, [activeTeam]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTeam) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        for (const row of data) {
          const customerData = {
            ...(row as any),
            teamId: activeTeam.id,
            id: `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          };
          await fetch('http://localhost:5000/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
          });
        }
        await fetchCustomers();
      } catch (err) {
        console.error(err);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) return;
    setIsDeleting(true);
    try {
      for (const id of ids) {
        await fetch(`http://localhost:5000/customers/${id}`, { method: 'DELETE' });
      }
      setSelectedRows([]);
      await fetchCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const searchString = Object.values(c).join(" ").toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getHeaders = () => {
    if (customers.length === 0) return ["name", "email", "plan", "status"];
    const keys = new Set<string>();
    customers.forEach(c => Object.keys(c).forEach(k => {
      if (k !== 'id' && k !== 'teamId') keys.add(k);
    }));
    if (!keys.has('email')) keys.add('email');
    return Array.from(keys);
  };
  const headers = getHeaders();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(paginatedCustomers.map(c => c.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">View and manage your customer accounts and usage.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <button 
              onClick={() => handleDelete(selectedRows)}
              disabled={isDeleting}
              className="flex items-center gap-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm border border-transparent disabled:opacity-50"
            >
              {isDeleting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="w-4 h-4" />}
              Delete Selected ({selectedRows.length})
            </button>
          )}
          <input 
            type="file" 
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting || !canImportData}
            className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm border border-border disabled:opacity-50"
          >
            {isImporting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : (
              !canImportData ? <Lock className="w-4 h-4" /> : <Upload className="w-4 h-4" />
            )} 
            {isImporting ? "Importing..." : "Import Data"}
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-lg overflow-hidden border border-border flex flex-col max-h-[800px]">

        <div className="relative z-10 p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 bg-card justify-between shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-card text-foreground transition-colors">
              Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-card text-foreground transition-colors">
              Export <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 overflow-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-12 flex justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>
          ) : (
            <table className="w-full text-sm text-left relative">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-background border-b border-border sticky top-0 z-20 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold sticky left-0 bg-background z-30 border-r border-border/50 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-border bg-background focus:ring-primary cursor-pointer w-4 h-4 accent-primary"
                      checked={paginatedCustomers.length > 0 && selectedRows.length === paginatedCustomers.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold sticky left-12 bg-background z-30 border-r border-border/50 whitespace-nowrap shadow-[4px_0_12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.2)]">ID</th>
                  {headers.map(h => (
                    <th key={h} className="px-6 py-4 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-6 py-4 font-semibold text-right sticky right-0 bg-background z-30 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id} className={`hover:bg-muted/50 transition-colors group ${selectedRows.includes(customer.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4 sticky left-0 bg-background group-hover:bg-muted border-r border-border/50 z-10 w-12 transition-colors">
                      <input 
                        type="checkbox" 
                        className="rounded border-border bg-background focus:ring-primary cursor-pointer w-4 h-4 accent-primary"
                        checked={selectedRows.includes(customer.id)}
                        onChange={() => handleSelectRow(customer.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground sticky left-12 bg-background group-hover:bg-muted border-r border-border/50 z-10 whitespace-nowrap shadow-[4px_0_12px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_12px_rgba(0,0,0,0.2)] transition-colors">
                      {customer.id}
                    </td>
                    {headers.map(h => (
                      <td key={h} className="px-6 py-4 whitespace-nowrap">
                        {h === 'name' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-md bg-muted flex items-center justify-center text-foreground font-medium border border-border transition-colors uppercase">
                              {customer.name ? customer.name.substring(0, 2) : "C"}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{customer.name || "-"}</p>
                              {customer.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : h === 'email' ? (
                          <span className="text-foreground">{customer.email || "-"}</span>
                        ) : h === 'status' ? (
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${customer.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                            <span className="font-medium">{customer.status || "-"}</span>
                          </div>
                        ) : (
                          <span className="font-medium text-foreground">{customer[h] || "-"}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-right sticky right-0 bg-background group-hover:bg-muted z-10 transition-colors">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete([customer.id])}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors border border-transparent hover:border-border/50">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={headers.length + 3} className="px-6 py-12 text-center text-muted-foreground">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-background border border-border rounded-md px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
            <span className="ml-4 border-l border-border pl-4">
              Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNum ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md border border-border bg-background text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
