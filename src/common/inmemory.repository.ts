export class InMemoryRepository<T extends { gid: string }> {
    protected items = new Map<string, T>();
  
    findAll(): T[] {
      return [...this.items.values()];
    }
  
    findById(id: string): T | undefined {
      return this.items.get(id);
    }
  
    create(obj: T): T {
      this.items.set(obj.gid, obj);
      return obj;
    }
  
    update(id: string, patch: Partial<T>): T {
      const existing = this.items.get(id);
      if (!existing) throw new Error('Not found');
      const updated = { ...existing, ...patch };
      this.items.set(id, updated);
      return updated;
    }
  
    delete(id: string): boolean {
      return this.items.delete(id);
    }
  }
  